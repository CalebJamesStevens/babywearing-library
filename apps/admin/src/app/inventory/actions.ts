"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { db, carrierInstances, carriers } from "@babywearing/db";
import { eq } from "@babywearing/db";

type ActionState = {
  ok: boolean;
  error?: string;
};

async function uploadImage(
  formData: FormData,
  fieldName: string,
  prefix: string
) {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) return null;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filename = `${prefix}-${Date.now()}-${safeName}`;
  const blob = await put(filename, file, { access: "public" });
  return blob.url;
}

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

    const uploadedUrl = await uploadImage(formData, "imageFile", "carrier");
    const fallbackUrl = String(formData.get("imageUrl") || "").trim();
    const imageUrl = uploadedUrl ?? (fallbackUrl || null);

    await db.insert(carriers).values({
      brand,
      type: type as
        | "soft_structured_carrier"
        | "ring_sling"
        | "woven_wrap"
        | "stretch_wrap"
        | "meh_dai_half_buckle"
        | "onbuhimo",
      model: String(formData.get("model") || "") || null,
      description: String(formData.get("description") || "") || null,
      imageUrl,
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

    const uploadedUrl = await uploadImage(formData, "imageFile", "instance");
    const fallbackUrl = String(formData.get("imageUrl") || "").trim();
    const imageUrl = uploadedUrl ?? (fallbackUrl || null);

    await db.insert(carrierInstances).values({
      carrierId,
      status: "available",
      serialNumber: String(formData.get("serialNumber") || "") || null,
      material: String(formData.get("material") || "") || null,
      colorPattern: String(formData.get("colorPattern") || "") || null,
      conditionNotes: String(formData.get("conditionNotes") || "") || null,
      issues: String(formData.get("issues") || "") || null,
      location: String(formData.get("location") || "") || null,
      imageUrl,
    });

    revalidatePath("/inventory");
    revalidatePath(`/inventory/${carrierId}`);
  } catch (error) {
    console.error("createInstance failed", error);
    throw error;
  }
}

export async function createInstanceWithState(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const carrierId = String(formData.get("carrierId") || "");
    if (!carrierId) {
      return { ok: false, error: "Select a carrier model first." };
    }

    const uploadedUrl = await uploadImage(formData, "imageFile", "instance");
    const fallbackUrl = String(formData.get("imageUrl") || "").trim();
    const imageUrl = uploadedUrl ?? (fallbackUrl || null);

    await db.insert(carrierInstances).values({
      carrierId,
      status: "available",
      serialNumber: String(formData.get("serialNumber") || "") || null,
      material: String(formData.get("material") || "") || null,
      colorPattern: String(formData.get("colorPattern") || "") || null,
      conditionNotes: String(formData.get("conditionNotes") || "") || null,
      issues: String(formData.get("issues") || "") || null,
      location: String(formData.get("location") || "") || null,
      imageUrl,
    });

    revalidatePath("/inventory");
    revalidatePath(`/inventory/${carrierId}`);
    return { ok: true };
  } catch (error) {
    console.error("createInstance failed", error);
    return { ok: false, error: "Unable to add inventory. Try again." };
  }
}

export async function updateInstance(formData: FormData) {
  try {
    const instanceId = String(formData.get("instanceId") || "");
    const carrierId = String(formData.get("carrierId") || "");
    if (!instanceId) return;

    const uploadedUrl = await uploadImage(formData, "imageFile", "instance");
    const fallbackUrl = String(formData.get("imageUrl") || "").trim();
    const imageUrl = uploadedUrl ?? (fallbackUrl || null);

    await db
      .update(carrierInstances)
      .set({
        status: String(formData.get("status") || "available") as
          | "available"
          | "checked_out"
          | "maintenance"
          | "retired",
        issues: String(formData.get("issues") || "") || null,
        material: String(formData.get("material") || "") || null,
        colorPattern: String(formData.get("colorPattern") || "") || null,
        conditionNotes: String(formData.get("conditionNotes") || "") || null,
        location: String(formData.get("location") || "") || null,
        imageUrl,
      })
      .where(eq(carrierInstances.id, instanceId));

    revalidatePath("/inventory");
    if (carrierId) {
      revalidatePath(`/inventory/${carrierId}`);
    }
  } catch (error) {
    console.error("updateInstance failed", error);
    throw error;
  }
}

export async function updateCarrier(formData: FormData) {
  try {
    const carrierId = String(formData.get("carrierId") || "");
    if (!carrierId) return;

    const brand = String(formData.get("brand") || "").trim();
    const type = String(formData.get("type") || "").trim();
    if (!brand || !type) return;

    const uploadedUrl = await uploadImage(formData, "imageFile", "carrier");
    const fallbackUrl = String(formData.get("imageUrl") || "").trim();
    const imageUrl = uploadedUrl ?? (fallbackUrl || null);

    await db
      .update(carriers)
      .set({
        brand,
        type: type as
          | "soft_structured_carrier"
          | "ring_sling"
          | "woven_wrap"
          | "stretch_wrap"
          | "meh_dai_half_buckle"
          | "onbuhimo",
        model: String(formData.get("model") || "").trim() || null,
        description: String(formData.get("description") || "").trim() || null,
        imageUrl,
        videoUrl: String(formData.get("videoUrl") || "").trim() || null,
        safetyInfo: String(formData.get("safetyInfo") || "").trim() || null,
        safetyTests: String(formData.get("safetyTests") || "").trim() || null,
        recallInfo: String(formData.get("recallInfo") || "").trim() || null,
        manufacturerUrl: String(formData.get("manufacturerUrl") || "").trim() || null,
      })
      .where(eq(carriers.id, carrierId));

    revalidatePath("/inventory");
    revalidatePath(`/inventory/${carrierId}`);
  } catch (error) {
    console.error("updateCarrier failed", error);
    throw error;
  }
}

export async function generateQr(formData: FormData) {
  try {
    const instanceId = String(formData.get("instanceId") || "");
    const carrierId = String(formData.get("carrierId") || "");
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
    if (carrierId) {
      revalidatePath(`/inventory/${carrierId}`);
    }
  } catch (error) {
    console.error("generateQr failed", error);
    throw error;
  }
}

export async function deleteInstance(formData: FormData) {
  try {
    const instanceId = String(formData.get("instanceId") || "");
    const carrierId = String(formData.get("carrierId") || "");
    if (!instanceId) return;

    await db.delete(carrierInstances).where(eq(carrierInstances.id, instanceId));

    revalidatePath("/inventory");
    if (carrierId) {
      revalidatePath(`/inventory/${carrierId}`);
    }
  } catch (error) {
    console.error("deleteInstance failed", error);
    throw error;
  }
}
