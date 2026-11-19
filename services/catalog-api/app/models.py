"""SQLAlchemy mappings for the tables owned by the Next.js app (Drizzle schema).

This service only reads them; migrations stay in Drizzle (src/db/schema.ts).
"""

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

# Postgres text[] in production, JSON in the SQLite test database.
TextArray = ARRAY(Text).with_variant(JSON(), "sqlite")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(Text, unique=True)
    name: Mapped[str] = mapped_column(Text)
    brand: Mapped[str] = mapped_column(Text, default="")
    audience: Mapped[str] = mapped_column(String)  # pg enum: men|women|unisex|kids
    price_cents: Mapped[int] = mapped_column(Integer)
    compare_at_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str] = mapped_column(Text, default="")
    images: Mapped[list[str]] = mapped_column(TextArray, default=list)
    colors: Mapped[list[str]] = mapped_column(TextArray, default=list)
    sizes: Mapped[list[str]] = mapped_column(TextArray, default=list)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    is_new: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_name: Mapped[str] = mapped_column(Text)
    country: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="pending")
    shipping_cents: Mapped[int] = mapped_column(Integer, default=0)
    total_cents: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    name: Mapped[str] = mapped_column(Text)
    size: Mapped[str] = mapped_column(Text)
    price_cents: Mapped[int] = mapped_column(Integer)
    qty: Mapped[int] = mapped_column(Integer)

    order: Mapped[Order] = relationship(back_populates="items")
