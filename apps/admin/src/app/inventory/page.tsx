import { db, carrierInstances, carriers } from "@babywearing/db";
import { eq } from "@babywearing/db";
import { requireAdmin } from "@/lib/require-admin";
import AddCarrierModal from "@/components/AddCarrierModal";
import InventoryUnitGrid from "@/components/InventoryUnitGrid";

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

  const groupedByType = new Map<string, Map<string, typeof instanceRows>>();
  for (const instance of instanceRows) {
    const typeKey = instance.type;
    const brandKey = instance.brand;
    const brandMap = groupedByType.get(typeKey) ?? new Map<string, typeof instanceRows>();
    const list = brandMap.get(brandKey) ?? [];
    list.push(instance);
    brandMap.set(brandKey, list);
    groupedByType.set(typeKey, brandMap);
  }

  const typeLabels: Record<string, string> = {
    soft_structured_carrier: "Soft structured carrier",
    ring_sling: "Ring sling",
    woven_wrap: "Woven wrap",
    stretch_wrap: "Stretch wrap",
    meh_dai_half_buckle: "Meh dai / half buckle",
    onbuhimo: "Onbuhimo",
  };

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
          {instanceRows.length === 0 ? (
            <p className="text-sm text-slate-600">No carrier instances yet.</p>
          ) : (
            <div className="space-y-6">
              {Array.from(groupedByType.entries()).map(([type, brandMap]) => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {typeLabels[type] ?? type}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {Array.from(brandMap.values()).reduce((sum, items) => sum + items.length, 0)} units
                    </span>
                  </div>
                  <div className="space-y-5">
                    {Array.from(brandMap.entries())
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([brand, items]) => (
                        <div key={`${type}-${brand}`} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-slate-800">{brand}</h4>
                            <span className="text-xs text-slate-500">{items.length} units</span>
                          </div>
                          <InventoryUnitGrid instances={items} />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
