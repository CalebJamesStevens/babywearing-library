import { db, carrierInstances, carriers, checkouts } from "@babywearing/db";
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

  const candidates = await db.execute(
    sql<{ table_schema: string; table_name: string }>`
      select table_schema, table_name
      from information_schema.tables
      where table_name in ('users', 'user')
        and table_schema not in ('pg_catalog', 'information_schema')
      order by table_schema, table_name`
  );

  let neonUserCount = 0;
  let memberSource = "not found";
  let memberError: string | null = null;
  for (const candidate of candidates.rows) {
    try {
      const result = await db.execute(
        sql.raw(
          `select count(*)::int as count from "${candidate.table_schema}"."${candidate.table_name}"`
        ) as unknown as Parameters<typeof db.execute>[0]
      );
      neonUserCount = Number(result.rows?.[0]?.count ?? 0);
      memberSource = `${candidate.table_schema}.${candidate.table_name}`;
      break;
    } catch (error) {
      memberError = error instanceof Error ? error.message : "Unknown error";
    }
  }

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
      <section className="card-lg">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Library dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Quick snapshot of inventory and checkouts.
        </p>
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Member source: {memberSource} · candidates: {candidates.rows.length}
          {memberError ? (
            <span className="text-rose-600"> · {memberError}</span>
          ) : null}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Carriers", value: Number(carrierCount) },
            { label: "Instances", value: Number(instanceCount) },
            { label: "Members", value: neonUserCount },
            { label: "Pending requests", value: Number(pendingCount) },
            { label: "Active checkouts", value: Number(approvedCount) },
          ].map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
