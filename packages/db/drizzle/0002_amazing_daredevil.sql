ALTER TABLE "carrier_instances" ADD COLUMN "material" varchar(160);--> statement-breakpoint
ALTER TABLE "carrier_instances" ADD COLUMN "color_pattern" varchar(160);--> statement-breakpoint
ALTER TABLE "carriers" DROP COLUMN "material";