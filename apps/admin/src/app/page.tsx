import { db, carrierInstances, carriers, checkouts, members } from "@babywearing/db";
import { requireAdmin } from "@/lib/require-admin";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const [{ count: carrierCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(carriers);

  const [{ count: instanceCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(carrierInstances);

  const [{ count: memberCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(members);

  const [{ count: pendingCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(checkouts)
    .where(eq(checkouts.status, "pending"));

  const [{ count: approvedCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(checkouts)
    .where(eq(checkouts.status, "approved"));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Library dashboard</h1>
        <p className="mt-2 text-sm text-ink/60">
          Quick snapshot of inventory and checkouts.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            { label: "Carriers", value: carrierCount },
            { label: "Instances", value: instanceCount },
            { label: "Members", value: memberCount },
            { label: "Pending requests", value: pendingCount },
            { label: "Active checkouts", value: approvedCount },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl bg-slate px-4 py-5">
              <p className="text-xs uppercase text-ink/50">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
