"""Small in-memory sliding-window rate limiter for the AI endpoint.

Every /search/ai call costs money, so one client must not be able to spam it.
In-memory state is per process: fine for a single instance. With several
instances, move this to Redis or the edge (Cloudflare, API gateway).
"""

import threading
import time
from collections import deque

from fastapi import HTTPException, Request, status

from app.config import get_settings


class SlidingWindowLimiter:
    def __init__(self, max_requests: int, window_seconds: float, max_keys: int = 10_000):
        self.max_requests = max_requests
        self.window = window_seconds
        self.max_keys = max_keys
        self._hits: dict[str, deque[float]] = {}
        self._lock = threading.Lock()

    def check(self, key: str) -> float | None:
        """Record a hit. Returns None if allowed, else seconds until retry."""
        now = time.monotonic()
        with self._lock:
            hits = self._hits.get(key)
            if hits is None:
                if len(self._hits) >= self.max_keys:
                    self._evict(now)
                hits = self._hits[key] = deque()
            while hits and now - hits[0] >= self.window:
                hits.popleft()
            if len(hits) >= self.max_requests:
                return self.window - (now - hits[0])
            hits.append(now)
            return None

    def _evict(self, now: float) -> None:
        # Drop idle clients first; if still full, drop everything (bounded memory
        # beats perfect accounting under a flood of unique IPs).
        stale = [k for k, h in self._hits.items() if not h or now - h[-1] >= self.window]
        for k in stale:
            del self._hits[k]
        if len(self._hits) >= self.max_keys:
            self._hits.clear()

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


ai_limiter = SlidingWindowLimiter(max_requests=get_settings().ai_rate_limit_per_minute, window_seconds=60)


def limit_ai_search(request: Request) -> None:
    # request.client is the direct peer. Behind a proxy, run uvicorn with
    # --proxy-headers and FORWARDED_ALLOW_IPS set to the proxy's IP so this is
    # the real client; never trust X-Forwarded-For from arbitrary callers.
    key = request.client.host if request.client else "unknown"
    retry_after = ai_limiter.check(key)
    if retry_after is not None:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many AI searches, slow down",
            headers={"Retry-After": str(max(1, int(retry_after) + 1))},
        )
