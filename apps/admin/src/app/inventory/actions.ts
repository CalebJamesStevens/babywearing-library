"use server";

import { revalidatePath } from "next/cache";
import { db, carrierInstances, carriers } from "@babywearing/db";
import { eq } from "drizzle-orm";

type ActionState = {
  ok: boolean;
  error?: string;
};

export async function createCarrier(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const brand = String(formData.get("brand") || "").trim();
    const type = String(formData.get("type") || "").trim();
    if (!brand || !type) {
      return { ok: false, error: "Brand and type are required." };
    }

    await db.insert(carriers).values({
      brand,
      type,
      model: String(formData.get("model") || "") || null,
      material: String(formData.get("material") || "") || null,
      description: String(formData.get("description") || "") || null,
      imageUrl: String(formData.get("imageUrl") || "") || null,
      videoUrl: String(formData.get("videoUrl") || "") || null,
      safetyInfo: String(formData.get("safetyInfo") || "") || null,
      safetyTests: String(formData.get("safetyTests") || "") || null,
      recallInfo: String(formData.get("recallInfo") || "") || null,
      manufacturerUrl: String(formData.get("manufacturerUrl") || "") || null,
    });

    revalidatePath("/inventory");
    return { ok: true };
  } catch (error) {
    console.error("createCarrier failed", error);
    return { ok: false, error: "Unable to add carrier. Try again." };
  }
}

export async function createInstance(formData: FormData) {
  try {
    const carrierId = String(formData.get("carrierId") || "");
    if (!carrierId) return;

    await db.insert(carrierInstances).values({
      carrierId,
      status: "available",
      serialNumber: String(formData.get("serialNumber") || "") || null,
      conditionNotes: String(formData.get("conditionNotes") || "") || null,
      issues: String(formData.get("issues") || "") || null,
      location: String(formData.get("location") || "") || null,
      imageUrl: String(formData.get("imageUrl") || "") || null,
    });

    revalidatePath("/inventory");
  } catch (error) {
    console.error("createInstance failed", error);
    throw error;
  }
}

export async function updateInstance(formData: FormData) {
  try {
    const instanceId = String(formData.get("instanceId") || "");
    if (!instanceId) return;

    await db
      .update(carrierInstances)
      .set({
        status: String(formData.get("status") || "available") as
          | "available"
          | "checked_out"
          | "maintenance"
          | "retired",
        issues: String(formData.get("issues") || "") || null,
        conditionNotes: String(formData.get("conditionNotes") || "") || null,
        location: String(formData.get("location") || "") || null,
        imageUrl: String(formData.get("imageUrl") || "") || null,
      })
      .where(eq(carrierInstances.id, instanceId));

    revalidatePath("/inventory");
  } catch (error) {
    console.error("updateInstance failed", error);
    throw error;
  }
}

export async function generateQr(formData: FormData) {
  try {
    const instanceId = String(formData.get("instanceId") || "");
    if (!instanceId) return;

    const baseUrl = process.env.WEB_BASE_URL;
    if (!baseUrl) return;

    await db
      .update(carrierInstances)
      .set({
        qrCodeValue: `${baseUrl}/carriers/${instanceId}`,
      })
      .where(eq(carrierInstances.id, instanceId));

    revalidatePath("/inventory");
  } catch (error) {
    console.error("generateQr failed", error);
    throw error;
  }
}
