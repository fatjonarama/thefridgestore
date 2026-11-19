import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["ADMIN_API_KEY"] = "test-admin-key"
os.environ.pop("ANTHROPIC_API_KEY", None)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app
from app.models import Order, OrderItem, Product
from app.ratelimit import ai_limiter

PRODUCTS = [
    dict(slug="blackout-04", name="Blackout 04", brand="Fridge", audience="men", price_cents=12800,
         description="Low-profile street runner in triple black.", colors=["#0d0d0d"],
         sizes=["40", "41", "42", "43"], stock=24, is_new=True),
    dict(slug="curb-runner", name="Curb Runner", brand="Fridge", audience="men", price_cents=15200,
         compare_at_cents=17500, description="Chunky retro trainer.", sizes=["42", "44"], stock=15),
    dict(slug="petal", name="Petal Low", brand="Bloom", audience="women", price_cents=9900,
         description="Soft pink everyday sneaker.", sizes=["37", "38", "39"], stock=0),
    dict(slug="hidden", name="Hidden Shoe", brand="Fridge", audience="unisex", price_cents=5000,
         description="Inactive product.", sizes=["42"], stock=5, active=False),
]


@pytest.fixture()
def db():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    session = Session()
    for p in PRODUCTS:
        session.add(Product(**{"images": [], "colors": [], **p}))
    o1 = Order(customer_name="A", country="Kosovo", status="confirmed", total_cents=28000)
    o2 = Order(customer_name="B", country="Albania", status="pending", total_cents=12800)
    o3 = Order(customer_name="C", country="Kosovo", status="cancelled", total_cents=99900)
    session.add_all([o1, o2, o3])
    session.flush()
    session.add_all([
        OrderItem(order_id=o1.id, name="Curb Runner", size="42", price_cents=15200, qty=1),
        OrderItem(order_id=o1.id, name="Blackout 04", size="42", price_cents=12800, qty=1),
        OrderItem(order_id=o2.id, name="Blackout 04", size="41", price_cents=12800, qty=1),
        OrderItem(order_id=o3.id, name="Petal Low", size="38", price_cents=9900, qty=10),
    ])
    session.commit()
    yield session
    session.close()


@pytest.fixture()
def client(db):
    ai_limiter.reset()
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()
