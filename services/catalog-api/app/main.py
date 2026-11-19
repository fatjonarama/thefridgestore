import logging
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import ai
from app.db import get_db
from app.models import Product
from app.ratelimit import limit_ai_search
from app.repository import order_stats, search_products
from app.schemas import (
    AISearchRequest,
    AISearchResponse,
    Audience,
    OrderStats,
    ProductFilters,
    ProductOut,
    SortOrder,
)
from app.security import require_admin

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("catalog-api")

app = FastAPI(
    title="The Fridge Store Catalog API",
    version="0.1.0",
    description="Product search (including natural-language search with Claude) and order analytics.",
)

DB = Annotated[Session, Depends(get_db)]


def _product_out(p: Product) -> ProductOut:
    return ProductOut(
        slug=p.slug,
        name=p.name,
        brand=p.brand,
        audience=p.audience,  # type: ignore[arg-type]
        price_cents=p.price_cents,
        compare_at_cents=p.compare_at_cents,
        description=p.description,
        images=p.images or [],
        colors=p.colors or [],
        sizes=p.sizes or [],
        in_stock=p.stock > 0,
        is_new=p.is_new,
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/products", response_model=list[ProductOut])
def list_products(
    db: DB,
    q: Annotated[str | None, Query(max_length=100)] = None,
    brand: str | None = None,
    audience: Audience | None = None,
    size: str | None = None,
    min_price_eur: Annotated[float | None, Query(ge=0)] = None,
    max_price_eur: Annotated[float | None, Query(ge=0)] = None,
    in_stock_only: bool = False,
    sort: SortOrder = "newest",
    limit: Annotated[int, Query(ge=1, le=100)] = 24,
) -> list[ProductOut]:
    filters = ProductFilters(
        keywords=q,
        brand=brand,
        audience=audience,
        size=size,
        min_price_eur=min_price_eur,
        max_price_eur=max_price_eur,
        in_stock_only=in_stock_only,
        sort=sort,
    )
    return [_product_out(p) for p in search_products(db, filters, limit)]


@app.get("/products/{slug}", response_model=ProductOut)
def get_product(slug: str, db: DB) -> ProductOut:
    product = db.scalar(select(Product).where(Product.slug == slug, Product.active.is_(True)))
    if product is None:
        raise HTTPException(404, "Product not found")
    return _product_out(product)


@app.post("/search/ai", response_model=AISearchResponse, dependencies=[Depends(limit_ai_search)])
def ai_search(body: AISearchRequest, db: DB) -> AISearchResponse:
    try:
        filters = ai.parse_query(body.query)
        engine = "claude"
    except ai.AIUnavailable as exc:
        log.info("AI search unavailable (%s); using keyword fallback", exc)
        filters = ai.keyword_filters(body.query)
        engine = "keyword_fallback"

    results = search_products(db, filters)
    return AISearchResponse(
        query=body.query,
        interpreted_as=filters,
        engine=engine,
        results=[_product_out(p) for p in results],
    )


@app.get("/admin/orders/stats", response_model=OrderStats, dependencies=[Depends(require_admin)])
def get_order_stats(db: DB) -> OrderStats:
    return OrderStats(**order_stats(db))
