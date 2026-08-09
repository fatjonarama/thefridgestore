CREATE TYPE "public"."country" AS ENUM('Kosovo', 'Albania', 'North Macedonia');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "country" "country" NOT NULL DEFAULT 'Kosovo';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_cents" integer DEFAULT 0 NOT NULL;