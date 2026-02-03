import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db, carrierInstances } from "@babywearing/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { instanceId: string } }
) {
  const baseUrl = process.env.WEB_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "WEB_BASE_URL missing" }, { status: 500 });
  }

  const [instance] = await db
    .select({ qrCodeValue: carrierInstances.qrCodeValue })
    .from(carrierInstances)
    .where(eq(carrierInstances.id, params.instanceId));

  const value =
    instance?.qrCodeValue ?? `${baseUrl}/carriers/${params.instanceId}`;

  const png = await QRCode.toBuffer(value, { width: 512, margin: 2 });
  return new NextResponse(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
