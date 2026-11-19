from app import ai
from app.schemas import ProductFilters


def test_uses_claude_filters(client, monkeypatch):
    def fake_parse(query):
        return ProductFilters(audience="men", max_price_eur=140, size="42", in_stock_only=True)

    monkeypatch.setattr(ai, "parse_query", fake_parse)
    resp = client.post("/search/ai", json={"query": "men's shoes under 140 in 42"})
    body = resp.json()
    assert resp.status_code == 200
    assert body["engine"] == "claude"
    assert body["interpreted_as"]["max_price_eur"] == 140
    assert [p["slug"] for p in body["results"]] == ["blackout-04"]


def test_falls_back_to_keywords_without_api_key(client):
    # conftest unsets ANTHROPIC_API_KEY, so the real parse_query raises AIUnavailable.
    body = client.post("/search/ai", json={"query": "retro"}).json()
    assert body["engine"] == "keyword_fallback"
    assert [p["slug"] for p in body["results"]] == ["curb-runner"]


def test_validates_query_length(client):
    assert client.post("/search/ai", json={"query": "x" * 500}).status_code == 422


def test_rate_limits_ai_search(client):
    from app.ratelimit import ai_limiter

    for _ in range(ai_limiter.max_requests):
        assert client.post("/search/ai", json={"query": "retro"}).status_code == 200
    resp = client.post("/search/ai", json={"query": "retro"})
    assert resp.status_code == 429
    assert int(resp.headers["Retry-After"]) >= 1
    # Other endpoints are unaffected.
    assert client.get("/products").status_code == 200
