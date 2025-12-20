CREATE TYPE "public"."product_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "variant_name" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "sku" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_id" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "status" "product_status" DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "original_price" numeric;--> statement-breakpoint
ALTER TABLE "variants" DROP COLUMN "compare_at_price";--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_id_unique" UNIQUE("payment_id");