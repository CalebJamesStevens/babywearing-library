import { db, carrierInstances, carriers } from "@babywearing/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import AddInventoryModal from "@/components/AddInventoryModal";
import InventoryUnitGrid from "@/components/InventoryUnitGrid";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  soft_structured_carrier: "Soft structured carrier",
  ring_sling: "Ring sling",
  woven_wrap: "Woven wrap",
  stretch_wrap: "Stretch wrap",
  meh_dai_half_buckle: "Meh dai / half buckle",
  onbuhimo: "Onbuhimo",
};

type PageProps = {
  params: Promise<{ carrierId: string }>;
};

export default async function InventoryCarrierPage({ params }: PageProps) {
  await requireAdmin();

  const { carrierId } = await params;
  const carrierRow = await db
    .select()
    .from(carriers)
    .where(eq(carriers.id, carrierId))
    .limit(1);

  const carrier = carrierRow[0];
  if (!carrier) {
    notFound();
  }

  const instances = await db
    .select()
    .from(carrierInstances)
    .where(eq(carrierInstances.carrierId, carrierId))
    .orderBy(carrierInstances.createdAt);

  return (
    <div className="space-y-6">
      <section className="card-lg">
        <Link href="/inventory" className="btn-ghost inline-flex w-fit">
          <span className="text-base leading-none">‹</span>
          <span className="text-sm">Back</span>
        </Link>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {typeLabels[carrier.type] ?? carrier.type}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {carrier.brand}
              {carrier.model ? ` · ${carrier.model}` : ""}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {instances.length} units in inventory
            </p>
          </div>
          {carrier.imageUrl ? (
            <div className="h-28 w-28 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              <img
                src={carrier.imageUrl}
                alt={`${carrier.brand} ${carrier.model ?? ""}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Inventory units</h2>
            <p className="mt-1 text-sm text-slate-600">
              Tap a unit to view and edit details.
            </p>
          </div>
          <AddInventoryModal carrierId={carrierId} />
        </div>
        <div className="mt-4 space-y-4">
          {instances.length === 0 ? (
            <p className="text-sm text-slate-600">No units yet.</p>
          ) : (
            <InventoryUnitGrid carrierId={carrierId} instances={instances} />
          )}
        </div>
      </section>
    </div>
  );
}
