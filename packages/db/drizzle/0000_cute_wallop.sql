CREATE TYPE "public"."carrier_status" AS ENUM('available', 'checked_out', 'maintenance', 'retired');--> statement-breakpoint
CREATE TYPE "public"."checkout_status" AS ENUM('pending', 'approved', 'returned', 'canceled', 'denied');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'inactive', 'expired', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('cash', 'card', 'venmo', 'paypal', 'other');--> statement-breakpoint
CREATE TABLE "carrier_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carrier_id" uuid NOT NULL,
	"serial_number" varchar(120),
	"qr_code_value" text,
	"qr_code_image_url" text,
	"image_url" text,
	"status" "carrier_status" DEFAULT 'available' NOT NULL,
	"condition_notes" text,
	"issues" text,
	"location" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "carrier_instances_qr_code_value_unique" UNIQUE("qr_code_value")
);
--> statement-breakpoint
CREATE TABLE "carriers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" varchar(120) NOT NULL,
	"type" varchar(120) NOT NULL,
	"subtype" varchar(120),
	"model" varchar(160),
	"description" text,
	"image_url" text,
	"video_url" text,
	"safety_info" text,
	"recall_info" text,
	"safety_tests" text,
	"manufacturer_url" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carrier_instance_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"status" "checkout_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"returned_at" timestamp with time zone,
	"requested_notes" text,
	"condition_before" text,
	"condition_after" text,
	"approved_length_days" integer,
	"admin_notes" text
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(200) NOT NULL,
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"last_paid_at" timestamp with time zone,
	"payment_type" "payment_type",
	"contact_email" varchar(200),
	"contact_phone" varchar(50),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carrier_instance_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "carrier_instances" ADD CONSTRAINT "carrier_instances_carrier_id_carriers_id_fk" FOREIGN KEY ("carrier_id") REFERENCES "public"."carriers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_carrier_instance_id_carrier_instances_id_fk" FOREIGN KEY ("carrier_instance_id") REFERENCES "public"."carrier_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_carrier_instance_id_carrier_instances_id_fk" FOREIGN KEY ("carrier_instance_id") REFERENCES "public"."carrier_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;