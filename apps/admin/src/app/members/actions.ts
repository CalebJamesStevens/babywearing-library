"use server";

import { revalidatePath } from "next/cache";
import { db, members } from "@babywearing/db";
import { eq } from "drizzle-orm";

export async function upsertMember(formData: FormData) {
  const userId = String(formData.get("userId") || "").trim();
  if (!userId) return;

  const status = String(formData.get("status") || "active") as
    | "active"
    | "inactive"
    | "expired"
    | "suspended";
  const lastPaidAt = formData.get("lastPaidAt")
    ? new Date(String(formData.get("lastPaidAt")))
    : null;
  const paymentType = (String(formData.get("paymentType") || "") || null) as
    | "cash"
    | "card"
    | "venmo"
    | "paypal"
    | "other"
    | null;
  const contactEmail = String(formData.get("contactEmail") || "") || null;
  const contactPhone = String(formData.get("contactPhone") || "") || null;
  const notes = String(formData.get("notes") || "") || null;

  const existing = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(members)
      .set({
        status,
        lastPaidAt,
        paymentType,
        contactEmail,
        contactPhone,
        notes,
      })
      .where(eq(members.userId, userId));
  } else {
    await db.insert(members).values({
      userId,
      status,
      lastPaidAt,
      paymentType,
      contactEmail,
      contactPhone,
      notes,
    });
  }

  revalidatePath("/members");
}
