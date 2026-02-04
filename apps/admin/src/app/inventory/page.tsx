import { db, carrierInstances, carriers } from "@babywearing/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import AddCarrierModal from "@/components/AddCarrierModal";
import CarrierModelGrid from "@/components/CarrierModelGrid";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  await requireAdmin();
  const carrierRows = await db
    .select({
      id: carriers.id,
      brand: carriers.brand,
      model: carriers.model,
      type: carriers.type,
      imageUrl: carriers.imageUrl,
      instanceCount: sql<number>`count(${carrierInstances.id})`.as("instance_count"),
    })
    .from(carriers)
    .leftJoin(carrierInstances, eq(carrierInstances.carrierId, carriers.id))
    .groupBy(carriers.id)
    .orderBy(carriers.brand, carriers.model);

  const brandOptions = Array.from(
    new Set(carrierRows.map((carrier) => carrier.brand).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      <section className="card-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inventory</h1>
            <p className="mt-2 text-sm text-slate-600">
              Add carrier models, then manage individual inventory items per model.
            </p>
          </div>
          <AddCarrierModal brandOptions={brandOptions} />
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Carrier models</h2>
          <p className="text-xs text-slate-500">Tap a model to manage inventory.</p>
        </div>
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
          {carrierRows.length === 0 ? (
            <p className="text-sm text-slate-600">No carriers yet. Add your first model.</p>
          ) : (
            <CarrierModelGrid carriers={carrierRows} />
          )}
        </div>
      </section>
    </div>
  );
}
