from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models import Order, OrderItem, Product
from app.schemas import ProductFilters


def _escape_like(term: str) -> str:
    return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def build_product_query(f: ProductFilters) -> Select[tuple[Product]]:
    stmt = select(Product).where(Product.active.is_(True))

    if f.keywords:
        for word in f.keywords.split()[:8]:
            pattern = f"%{_escape_like(word)}%"
            stmt = stmt.where(
                or_(
                    Product.name.ilike(pattern, escape="\\"),
                    Product.brand.ilike(pattern, escape="\\"),
                    Product.description.ilike(pattern, escape="\\"),
                )
            )
    if f.brand:
        stmt = stmt.where(Product.brand.ilike(_escape_like(f.brand), escape="\\"))
    if f.audience:
        stmt = stmt.where(Product.audience == f.audience)
    if f.min_price_eur is not None:
        stmt = stmt.where(Product.price_cents >= round(f.min_price_eur * 100))
    if f.max_price_eur is not None:
        stmt = stmt.where(Product.price_cents <= round(f.max_price_eur * 100))
    if f.in_stock_only:
        stmt = stmt.where(Product.stock > 0)
    if f.new_only:
        stmt = stmt.where(Product.is_new.is_(True))
    if f.on_sale_only:
        stmt = stmt.where(Product.compare_at_cents > Product.price_cents)

    order_by = {
        "price_asc": Product.price_cents.asc(),
        "price_desc": Product.price_cents.desc(),
        "newest": Product.created_at.desc(),
    }[f.sort]
    return stmt.order_by(order_by, Product.id.desc())


def search_products(db: Session, f: ProductFilters, limit: int = 24) -> list[Product]:
    products = db.scalars(build_product_query(f)).all()
    # Size lives in a text[] column; filtering in Python keeps the query portable
    # (Postgres in prod, SQLite in tests). Fine at catalogue scale.
    if f.size:
        products = [p for p in products if f.size in (p.sizes or [])]
    return list(products[:limit])


def order_stats(db: Session) -> dict:
    total, revenue = db.execute(
        select(func.count(Order.id), func.coalesce(func.sum(Order.total_cents), 0)).where(Order.status != "cancelled")
    ).one()
    by_status = dict(db.execute(select(Order.status, func.count()).group_by(Order.status)).all())
    by_country = dict(
        db.execute(
            select(Order.country, func.count()).where(Order.status != "cancelled").group_by(Order.country)
        ).all()
    )
    top = db.execute(
        select(OrderItem.name, func.sum(OrderItem.qty).label("units"))
        .join(Order)
        .where(Order.status != "cancelled")
        .group_by(OrderItem.name)
        .order_by(func.sum(OrderItem.qty).desc())
        .limit(5)
    ).all()
    return {
        "total_orders": total,
        "revenue_cents": int(revenue),
        "average_order_cents": int(revenue) // total if total else 0,
        "by_status": by_status,
        "by_country": by_country,
        "top_products": [{"name": name, "units": int(units)} for name, units in top],
    }
