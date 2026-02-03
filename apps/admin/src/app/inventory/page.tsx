import { db, carrierInstances, carriers } from "@babywearing/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { createCarrier, createInstance, generateQr, updateInstance } from "@/app/inventory/actions";
import ActionButton from "@/components/ActionButton";
import AddCarrierForm from "@/components/AddCarrierForm";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  await requireAdmin();
  const carrierRows = await db.select().from(carriers).orderBy(carriers.brand);
  const brandOptions = Array.from(
    new Set(
      carrierRows
        .map((carrier) => carrier.brand)
        .filter((brand): brand is string => Boolean(brand))
    )
  );
  const instanceRows = await db
    .select({
      id: carrierInstances.id,
      carrierId: carrierInstances.carrierId,
      status: carrierInstances.status,
      issues: carrierInstances.issues,
      conditionNotes: carrierInstances.conditionNotes,
      location: carrierInstances.location,
      imageUrl: carrierInstances.imageUrl,
      qrCodeValue: carrierInstances.qrCodeValue,
      carrierBrand: carriers.brand,
      carrierModel: carriers.model,
      carrierMaterial: carriers.material,
      carrierType: carriers.type,
    })
    .from(carrierInstances)
    .leftJoin(carriers, eq(carrierInstances.carrierId, carriers.id))
    .orderBy(carriers.brand);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Inventory</h1>
        <p className="mt-2 text-sm text-ink/60">
          Add carriers, assign QR codes, and track condition notes.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Add carrier model</h2>
          <AddCarrierForm brandOptions={brandOptions} />
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Add carrier instance</h2>
          <form action={createInstance} className="mt-4 grid gap-2.5">
            <select name="carrierId" className="input">
              <option value="">Select carrier model</option>
              {carrierRows.map((carrier) => (
                <option key={carrier.id} value={carrier.id}>
                  {carrier.brand} {carrier.model ? `· ${carrier.model}` : ""}
                </option>
              ))}
            </select>
            <input name="serialNumber" placeholder="Serial number" className="input" />
            <input name="imageUrl" placeholder="Instance image URL" className="input" />
            <input name="location" placeholder="Storage location" className="input" />
            <textarea name="conditionNotes" placeholder="Condition notes" className="input h-20" />
            <textarea name="issues" placeholder="Known issues" className="input h-20" />
            <ActionButton className="rounded-full bg-lake px-4 py-2 text-sm font-semibold text-white">
              Add instance
            </ActionButton>
          </form>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Current inventory</h2>
        <div className="mt-4 space-y-4">
          {instanceRows.length === 0 ? (
            <p className="text-sm text-ink/60">No instances yet.</p>
          ) : (
            instanceRows.map((instance) => (
              <div key={instance.id} className="rounded-2xl border border-ink/10 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {instance.carrierBrand} {instance.carrierModel ?? ""}
                    </p>
                    <p className="text-xs text-ink/60">
                      {instance.carrierType}
                      {instance.carrierMaterial ? ` · ${instance.carrierMaterial}` : ""} · {instance.id}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={generateQr}>
                      <input type="hidden" name="instanceId" value={instance.id} />
                      <button className="rounded-full border border-ink/20 px-3 py-1 text-xs text-ink">
                        Generate QR
                      </button>
                    </form>
                    {instance.qrCodeValue ? (
                      <a
                        className="rounded-full bg-slate px-3 py-1 text-xs text-ink"
                        href={`/api/qr/${instance.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View QR
                      </a>
                    ) : null}
                  </div>
                </div>
                <form action={updateInstance} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="instanceId" value={instance.id} />
                  <select name="status" defaultValue={instance.status} className="input">
                    <option value="available">Available</option>
                    <option value="checked_out">Checked out</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                  <input name="location" defaultValue={instance.location ?? ""} placeholder="Location" className="input" />
                  <input name="imageUrl" defaultValue={instance.imageUrl ?? ""} placeholder="Image URL" className="input" />
                  <textarea name="conditionNotes" defaultValue={instance.conditionNotes ?? ""} placeholder="Condition notes" className="input h-20" />
                  <textarea name="issues" defaultValue={instance.issues ?? ""} placeholder="Known issues" className="input h-20" />
                  <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
                    Save updates
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
