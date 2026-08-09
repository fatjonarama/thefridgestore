-- Run this once in Neon's SQL Editor to bring your live database up to
-- date with tonight's changes: shipping/country on checkout, EU sizing,
-- and retiring the Kids audience.

-- 1. Add country + shipping fee to orders
CREATE TYPE "public"."country" AS ENUM('Kosovo', 'Albania', 'North Macedonia');
ALTER TABLE "orders" ADD COLUMN "country" "country" NOT NULL DEFAULT 'Kosovo';
ALTER TABLE "orders" ADD COLUMN "shipping_cents" integer DEFAULT 0 NOT NULL;

-- 2. Remove the sample "kids" product (Kids audience is retired storefront-side)
DELETE FROM products WHERE slug = 'bounce-hi';

-- 3. Switch the remaining sample products to EU sizing
UPDATE products SET sizes = '{"40","41","42","43","44","45","46"}' WHERE slug = 'blackout-04';
UPDATE products SET sizes = '{"40","41","42","43","44","45"}' WHERE slug = 'curb-runner';
UPDATE products SET sizes = '{"36","37","38","39","40","41"}' WHERE slug = 'vector-pace';
UPDATE products SET sizes = '{"36","37","38","39","40"}' WHERE slug = 'kinetic-zero';
