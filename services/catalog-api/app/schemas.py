from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Audience = Literal["men", "women", "unisex", "kids"]
SortOrder = Literal["newest", "price_asc", "price_desc"]


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str
    brand: str
    audience: Audience
    price_cents: int
    compare_at_cents: int | None
    description: str
    images: list[str]
    colors: list[str]
    sizes: list[str]
    in_stock: bool
    is_new: bool


class ProductFilters(BaseModel):
    """Search filters. Also the structured-output schema Claude fills in."""

    keywords: str | None = Field(None, description="Free-text words to match in name/description, e.g. 'runner black'")
    brand: str | None = Field(None, description="Brand name if the shopper named one")
    audience: Audience | None = None
    size: str | None = Field(None, description="Shoe size as a string, e.g. '42'")
    min_price_eur: float | None = Field(None, ge=0)
    max_price_eur: float | None = Field(None, ge=0)
    in_stock_only: bool = False
    new_only: bool = False
    on_sale_only: bool = Field(False, description="Only discounted items (has a compare-at price)")
    sort: SortOrder = "newest"


class AISearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=200, examples=["black running shoes for men under 150 euro in size 42"])


class AISearchResponse(BaseModel):
    query: str
    interpreted_as: ProductFilters
    engine: Literal["claude", "keyword_fallback"]
    results: list[ProductOut]


class OrderStats(BaseModel):
    total_orders: int
    revenue_cents: int
    average_order_cents: int
    by_status: dict[str, int]
    by_country: dict[str, int]
    top_products: list[dict[str, int | str]]
