CREATE TYPE "public"."carrier_type" AS ENUM('soft_structured_carrier', 'ring_sling', 'woven_wrap', 'stretch_wrap', 'meh_dai_half_buckle', 'onbuhimo');--> statement-breakpoint
ALTER TABLE "carriers" ALTER COLUMN "type" SET DATA TYPE "public"."carrier_type" USING "type"::"public"."carrier_type";--> statement-breakpoint
ALTER TABLE "carriers" ADD COLUMN "material" varchar(160);--> statement-breakpoint
ALTER TABLE "carriers" DROP COLUMN "subtype";