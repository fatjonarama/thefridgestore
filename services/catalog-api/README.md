# Catalog API (FastAPI)

A Python backend service for [The Fridge Store](../../README.md). It reads the
same Postgres (Neon) database as the Next.js app and adds:

- **Product search API**: filter by brand, audience, size, price range and stock, with sorting.
- **AI natural-language search** (`POST /search/ai`): Claude turns a sentence such as
  *"black runners for men under 150 in size 42"* into validated search filters.
- **Admin order analytics** (`GET /admin/orders/stats`): revenue, average order value,
  orders by status and country, and best-selling products, protected by an API key.

## Design decisions

| Concern | Approach |
|---|---|
| AI safety | Claude never writes SQL. It fills a Pydantic model through **structured outputs**, and our code builds a parameterised SQLAlchemy query from it. A prompt-injection attempt can only produce valid filters. |
| AI resilience | If the API key is missing, the API errors, it rate-limits us, or Claude declines, the endpoint **falls back to keyword search** and reports `engine: "keyword_fallback"`. Server-side refusal fallbacks are on as well. |
| Abuse/cost control | `/search/ai` is rate-limited per client IP (sliding window, default 10/min, `429` + `Retry-After`). Behind a proxy, set `FORWARDED_ALLOW_IPS` so the real client IP is used and a spoofed `X-Forwarded-For` header is ignored. |
| Cost/latency | Effort is set to `low` (simple extraction), queries are capped at 200 chars, and there is a 20 s timeout with 2 retries. |
| Schema ownership | Drizzle (`src/db/schema.ts`) owns migrations. This service maps the tables read-only and never runs `create_all` against production. |
| SQL injection / wildcards | Everything is a bound parameter, and `%`/`_` in user search terms are escaped so they don't act as LIKE wildcards. |
| Admin auth | The admin endpoint **fails closed** if `ADMIN_API_KEY` is unset and compares keys with `hmac.compare_digest` (constant time). |
| Input validation | Pydantic/FastAPI reject bad enums, negative prices and oversized limits with `422`. |
| Portability | `text[]` columns map to JSON on SQLite, so the test suite runs without Postgres. |

## Run locally

```bash
cd services/catalog-api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # fill in DATABASE_URL, ANTHROPIC_API_KEY, ADMIN_API_KEY
uvicorn app.main:app --reload
```

Interactive docs: http://localhost:8000/docs

```bash
curl -X POST localhost:8000/search/ai -H 'content-type: application/json' \
  -d '{"query": "black running shoes for men under 150 euro in size 42"}'
```

## Tests

```bash
pytest -q
```

The tests use an in-memory SQLite database and mock Claude, so they need no network or secrets.

## Deploy

```bash
docker build -t catalog-api . && docker run -p 8000:8000 --env-file .env catalog-api
```

The image runs as a non-root user. It works on any container host (Render, Fly.io, Railway, Cloud Run), and honours `$PORT`.

## Next steps

- Move rate limiting to Redis or the edge once there is more than one instance.
- A read-only Postgres role for this service.
- Call `/search/ai` from the Next.js `SearchOverlay`.
