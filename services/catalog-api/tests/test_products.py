def slugs(resp):
    assert resp.status_code == 200, resp.text
    return [p["slug"] for p in resp.json()]


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_lists_only_active_products(client):
    assert "hidden" not in slugs(client.get("/products"))


def test_filters_combine(client):
    resp = client.get("/products", params={"audience": "men", "max_price_eur": 130, "size": "42"})
    assert slugs(resp) == ["blackout-04"]


def test_in_stock_only(client):
    assert "petal" not in slugs(client.get("/products", params={"in_stock_only": True}))


def test_sort_by_price(client):
    assert slugs(client.get("/products", params={"sort": "price_asc"})) == ["petal", "blackout-04", "curb-runner"]


def test_keyword_search_treats_wildcards_literally(client):
    # "%" must not act as a SQL wildcard that matches everything.
    assert slugs(client.get("/products", params={"q": "%"})) == []


def test_rejects_invalid_input(client):
    assert client.get("/products", params={"audience": "aliens"}).status_code == 422
    assert client.get("/products", params={"limit": 1000}).status_code == 422


def test_get_product(client):
    assert client.get("/products/curb-runner").json()["compare_at_cents"] == 17500
    assert client.get("/products/hidden").status_code == 404
