from app.ratelimit import SlidingWindowLimiter


def test_window_expires(monkeypatch):
    now = [1000.0]
    monkeypatch.setattr("app.ratelimit.time.monotonic", lambda: now[0])
    limiter = SlidingWindowLimiter(max_requests=2, window_seconds=60)
    assert limiter.check("a") is None
    assert limiter.check("a") is None
    assert limiter.check("a") == 60
    assert limiter.check("b") is None  # limits are per client
    now[0] += 60
    assert limiter.check("a") is None


def test_memory_is_bounded():
    limiter = SlidingWindowLimiter(max_requests=1, window_seconds=60, max_keys=100)
    for i in range(1000):
        limiter.check(f"ip-{i}")
    assert len(limiter._hits) <= 100
