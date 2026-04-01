import { db, carrierInstances, carriers, checkouts, sql } from "@babywearing/db";
import { and, eq } from "@babywearing/db";
import CarrierBrowser, { type CarrierListItem } from "@/components/CarrierBrowser";
import HomeHero from "@/components/HomeHero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await db
    .select({
      instanceId: carrierInstances.id,
      instanceStatus: carrierInstances.status,
      instanceImage: carrierInstances.imageUrl,
      instanceMaterial: carrierInstances.material,
      instanceColorPattern: carrierInstances.colorPattern,
      issues: carrierInstances.issues,
      carrierBrand: sql<string>`coalesce(${carrierInstances.brand}, ${carriers.brand})`,
      carrierType: sql<string>`coalesce(${carrierInstances.type}, ${carriers.type})`,
      carrierModel: sql<string | null>`coalesce(${carrierInstances.model}, ${carriers.model})`,
      carrierSize: sql<string | null>`coalesce(${carrierInstances.size}, ${carriers.size})`,
      carrierImage: carriers.imageUrl,
      checkoutId: checkouts.id,
    })
    .from(carrierInstances)
    .leftJoin(carriers, eq(carrierInstances.carrierId, carriers.id))
    .leftJoin(
      checkouts,
      and(
        eq(checkouts.carrierInstanceId, carrierInstances.id),
        eq(checkouts.status, "approved")
      )
    );

  const carrierItems: CarrierListItem[] = rows.map((row) => {
    const availabilityStatus: CarrierListItem["availabilityStatus"] =
      row.instanceStatus === "maintenance" || row.instanceStatus === "retired"
        ? row.instanceStatus
        : row.instanceStatus === "checked_out" || row.checkoutId
          ? "checked_out"
          : "available";

    return {
      instanceId: row.instanceId,
      brand: row.carrierBrand,
      model: row.carrierModel,
      size: row.carrierSize,
      type: row.carrierType,
      material: row.instanceMaterial,
      colorPattern: row.instanceColorPattern,
      issues: row.issues,
      image: row.instanceImage || row.carrierImage,
      availabilityStatus,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <HomeHero />
      <CarrierBrowser items={carrierItems} />
    </div>
  );
}
