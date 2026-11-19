import hmac

from fastapi import Header, HTTPException, status

from app.config import get_settings


def require_admin(x_api_key: str | None = Header(default=None)) -> None:
    expected = get_settings().admin_api_key
    if not expected:
        # Fail closed: an unset key must never mean "open to everyone".
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Admin API not configured")
    # Constant-time comparison avoids leaking the key through response timing.
    if not x_api_key or not hmac.compare_digest(x_api_key.encode(), expected.encode()):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or missing API key")
