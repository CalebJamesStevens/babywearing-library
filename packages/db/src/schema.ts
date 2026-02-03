import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const carrierStatus = pgEnum("carrier_status", [
  "available",
  "checked_out",
  "maintenance",
  "retired",
]);

export const carrierType = pgEnum("carrier_type", [
  "soft_structured_carrier",
  "ring_sling",
  "woven_wrap",
  "stretch_wrap",
  "meh_dai_half_buckle",
  "onbuhimo",
]);

export const checkoutStatus = pgEnum("checkout_status", [
  "pending",
  "approved",
  "returned",
  "canceled",
  "denied",
]);

export const memberStatus = pgEnum("member_status", [
  "active",
  "inactive",
  "expired",
  "suspended",
]);

export const paymentType = pgEnum("payment_type", [
  "cash",
  "card",
  "venmo",
  "paypal",
  "other",
]);

export const carriers = pgTable("carriers", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand: varchar("brand", { length: 120 }).notNull(),
  type: carrierType("type").notNull(),
  model: varchar("model", { length: 160 }),
  material: varchar("material", { length: 160 }),
  description: text("description"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  safetyInfo: text("safety_info"),
  recallInfo: text("recall_info"),
  safetyTests: text("safety_tests"),
  manufacturerUrl: text("manufacturer_url"),
  details: jsonb("details").$type<Record<string, string | number | boolean | null>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const carrierInstances = pgTable("carrier_instances", {
  id: uuid("id").primaryKey().defaultRandom(),
  carrierId: uuid("carrier_id")
    .references(() => carriers.id, { onDelete: "cascade" })
    .notNull(),
  serialNumber: varchar("serial_number", { length: 120 }),
  qrCodeValue: text("qr_code_value").unique(),
  qrCodeImageUrl: text("qr_code_image_url"),
  imageUrl: text("image_url"),
  status: carrierStatus("status").default("available").notNull(),
  conditionNotes: text("condition_notes"),
  issues: text("issues"),
  location: varchar("location", { length: 160 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 200 }).notNull().unique(),
  status: memberStatus("status").default("active").notNull(),
  lastPaidAt: timestamp("last_paid_at", { withTimezone: true }),
  paymentType: paymentType("payment_type"),
  contactEmail: varchar("contact_email", { length: 200 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  carrierInstanceId: uuid("carrier_instance_id")
    .references(() => carrierInstances.id, { onDelete: "cascade" })
    .notNull(),
  memberId: uuid("member_id")
    .references(() => members.id, { onDelete: "set null" })
    .notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const checkouts = pgTable("checkouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  carrierInstanceId: uuid("carrier_instance_id")
    .references(() => carrierInstances.id, { onDelete: "cascade" })
    .notNull(),
  memberId: uuid("member_id")
    .references(() => members.id, { onDelete: "set null" })
    .notNull(),
  status: checkoutStatus("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  returnedAt: timestamp("returned_at", { withTimezone: true }),
  requestedNotes: text("requested_notes"),
  conditionBefore: text("condition_before"),
  conditionAfter: text("condition_after"),
  approvedLengthDays: integer("approved_length_days"),
  adminNotes: text("admin_notes"),
});
