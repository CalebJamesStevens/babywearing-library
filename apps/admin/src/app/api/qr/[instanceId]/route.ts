import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db, carrierInstances } from "@babywearing/db";
import { eq } from "@babywearing/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;
  const baseUrl = process.env.WEB_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "WEB_BASE_URL missing" }, { status: 500 });
  }

  const [instance] = await db
    .select({ qrCodeValue: carrierInstances.qrCodeValue })
    .from(carrierInstances)
    .where(eq(carrierInstances.id, instanceId));

  const value =
    instance?.qrCodeValue ?? `${baseUrl}/carriers/${instanceId}`;

  const png = await QRCode.toBuffer(value, { width: 512, margin: 2 });
  return new NextResponse(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
