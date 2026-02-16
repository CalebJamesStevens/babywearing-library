import { db, carrierInstances, carriers } from "@babywearing/db";
import { eq } from "@babywearing/db";
import { requireAdmin } from "@/lib/require-admin";
import AddCarrierModal from "@/components/AddCarrierModal";
import InventoryGroupedInstances from "@/components/InventoryGroupedInstances";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  await requireAdmin();

  const instanceRows = await db
    .select({
      id: carrierInstances.id,
      carrierId: carrierInstances.carrierId,
      status: carrierInstances.status,
      serialNumber: carrierInstances.serialNumber,
      material: carrierInstances.material,
      colorPattern: carrierInstances.colorPattern,
      imageUrl: carrierInstances.imageUrl,
      location: carrierInstances.location,
      conditionNotes: carrierInstances.conditionNotes,
      issues: carrierInstances.issues,
      qrCodeValue: carrierInstances.qrCodeValue,
      brand: carriers.brand,
      model: carriers.model,
      type: carriers.type,
    })
    .from(carrierInstances)
    .innerJoin(carriers, eq(carrierInstances.carrierId, carriers.id))
    .orderBy(carriers.type, carriers.brand, carriers.model, carrierInstances.createdAt);

  const allBrands = await db
    .select({ brand: carriers.brand })
    .from(carriers)
    .orderBy(carriers.brand);

  const brandOptions = Array.from(
    new Set(allBrands.map((carrier) => carrier.brand).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      <section className="card-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inventory</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage every carrier instance, grouped by type.
            </p>
          </div>
          <AddCarrierModal brandOptions={brandOptions} />
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Carrier instances</h2>
          <p className="text-xs text-slate-500">Grouped by type.</p>
        </div>
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
          <InventoryGroupedInstances instances={instanceRows} />
        </div>
      </section>
    </div>
  );
}
