"""Natural-language search: Claude turns a shopper's sentence into ProductFilters.

Claude never touches the database. It only fills in a validated Pydantic model
(structured outputs), and our own code builds the SQL from that. That keeps
prompt injection from reaching the query layer: the worst a malicious query can
do is produce odd-but-valid filters.
"""

import logging

import anthropic

from app.config import get_settings
from app.schemas import ProductFilters

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """You convert a shopper's request for The Fridge Store, a sneaker shop \
in Kosovo, Albania and North Macedonia, into search filters.

- Prices are in euros. "under 100" means max_price_eur=100.
- audience is men, women, unisex or kids. Only set it if the shopper implies one.
- Put descriptive words (colour, style, use) in keywords; leave out filler words.
- Set in_stock_only when the shopper needs it now, sizes, or availability.
- Leave a field empty rather than guessing.
The request may be in English, Albanian or Macedonian."""


class AIUnavailable(Exception):
    """Raised when Claude can't be used; the caller falls back to keyword search."""


_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    settings = get_settings()
    if not settings.anthropic_api_key:
        raise AIUnavailable("ANTHROPIC_API_KEY not configured")
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key, timeout=20.0, max_retries=2)
    return _client


def parse_query(query: str) -> ProductFilters:
    client = _get_client()
    try:
        response = client.beta.messages.parse(
            model=get_settings().claude_model,
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": query}],
            output_format=ProductFilters,
            output_config={"effort": "low"},  # simple extraction: keep latency and cost down
            # If a safety classifier declines, the API retries on a suitable model.
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
    except anthropic.RateLimitError as exc:
        raise AIUnavailable("rate limited") from exc
    except anthropic.APIStatusError as exc:
        log.warning("Claude API error %s: %s", exc.status_code, exc.message)
        raise AIUnavailable(f"api error {exc.status_code}") from exc
    except anthropic.APIConnectionError as exc:
        raise AIUnavailable("connection error") from exc

    if response.stop_reason == "refusal" or response.parsed_output is None:
        raise AIUnavailable(f"no usable output (stop_reason={response.stop_reason})")
    return response.parsed_output


def keyword_filters(query: str) -> ProductFilters:
    """Fallback when Claude is unavailable: plain keyword search."""
    return ProductFilters(keywords=query.strip())
