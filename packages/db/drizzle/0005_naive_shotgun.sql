ALTER TABLE "carrier_instances" ADD COLUMN "brand" varchar(120);--> statement-breakpoint
ALTER TABLE "carrier_instances" ADD COLUMN "type" "carrier_type";--> statement-breakpoint
ALTER TABLE "carrier_instances" ADD COLUMN "model" varchar(160);--> statement-breakpoint
ALTER TABLE "carrier_instances" ADD COLUMN "size" varchar(120);--> statement-breakpoint
UPDATE "carrier_instances" AS "ci"
SET
  "brand" = "c"."brand",
  "type" = "c"."type",
  "model" = "c"."model",
  "size" = "c"."size"
FROM "carriers" AS "c"
WHERE "ci"."carrier_id" = "c"."id";
