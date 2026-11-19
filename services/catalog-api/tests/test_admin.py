def test_requires_api_key(client):
    assert client.get("/admin/orders/stats").status_code == 401
    assert client.get("/admin/orders/stats", headers={"X-API-Key": "wrong"}).status_code == 401


def test_stats_exclude_cancelled_orders(client):
    resp = client.get("/admin/orders/stats", headers={"X-API-Key": "test-admin-key"})
    assert resp.status_code == 200
    stats = resp.json()
    assert stats["total_orders"] == 2
    assert stats["revenue_cents"] == 40800
    assert stats["average_order_cents"] == 20400
    assert stats["by_status"] == {"confirmed": 1, "pending": 1, "cancelled": 1}
    assert stats["by_country"] == {"Kosovo": 1, "Albania": 1}
    assert stats["top_products"][0] == {"name": "Blackout 04", "units": 2}
