import { db, members } from "@babywearing/db";
import { sql } from "@babywearing/db";
import { requireAdmin } from "@/lib/require-admin";
import MembersGrid from "@/components/MembersGrid";

export const dynamic = "force-dynamic";

type NeonUserRow = {
  id: string;
  email: string | null;
  name: string | null;
  created_at: Date | null;
};

export default async function MembersPage() {
  await requireAdmin();
  const memberRows = await db.select().from(members).orderBy(members.createdAt);
  const candidates = await db.execute(
    sql<{ table_schema: string; table_name: string }>`
      select table_schema, table_name
      from information_schema.tables
      where table_name in ('users', 'user')
        and table_schema not in ('pg_catalog', 'information_schema')
      order by table_schema, table_name`
  );

  let neonUsers: { rows: NeonUserRow[] } = { rows: [] };
  let sourceTable: string | null = null;
  let sourceError: string | null = null;
  for (const candidate of candidates.rows) {
    try {
      const columns = await db.execute(
        sql<{ column_name: string }>`
          select column_name
          from information_schema.columns
          where table_schema = ${candidate.table_schema}
            and table_name = ${candidate.table_name}
          order by ordinal_position`
      );
      const columnNames = columns.rows.map((col) => col.column_name);
      const hasEmail = columnNames.includes("email");
      const hasName = columnNames.includes("name");
      const hasCreatedAt =
        columnNames.includes("created_at") || columnNames.includes("createdAt");
      const createdColumn = columnNames.includes("created_at")
        ? `"created_at"`
        : columnNames.includes("createdAt")
        ? `"createdAt"`
        : null;
      const emailExpr = hasEmail ? `"email"` : "null as email";
      const nameExpr = hasName ? `"name"` : "null as name";
      const createdExpr = createdColumn ? `${createdColumn} as created_at` : "null as created_at";

      neonUsers = await db.execute(
        sql.raw(
          `select "id", ${emailExpr}, ${nameExpr}, ${createdExpr} from "${candidate.table_schema}"."${candidate.table_name}" order by ${createdColumn ?? "1"} desc nulls last`
        ) as unknown as Parameters<typeof db.execute>[0]
      );
      sourceTable = `${candidate.table_schema}.${candidate.table_name}`;
      break;
    } catch (error) {
      sourceError = error instanceof Error ? error.message : "Unknown error";
      // try next candidate
    }
  }

  const memberByUserId = new Map(memberRows.map((member) => [member.userId, member]));
  const entries = neonUsers.rows.map((user) => {
    const member = memberByUserId.get(user.id);
    return {
      user: {
        id: user.id,
        email: user.email ?? null,
        name: user.name ?? null,
        createdAt: user.created_at ? new Date(user.created_at).toISOString() : "",
      },
      member: member
        ? {
            status: member.status,
            lastPaidAt: member.lastPaidAt ? new Date(member.lastPaidAt).toISOString().slice(0, 10) : null,
            paymentType: member.paymentType ?? null,
            contactEmail: member.contactEmail ?? null,
            contactPhone: member.contactPhone ?? null,
            notes: member.notes ?? null,
          }
        : undefined,
    };
  });

  const requested = entries.filter((entry) => !entry.member);
  const approved = entries.filter((entry) => entry.member);

  return (
    <div className="space-y-6">
      <section className="card-lg">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Members</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track Neon users, membership status, and payment history.
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Requested members</h2>
        <p className="mt-2 text-sm text-slate-600">
          Tap a Neon Auth user to approve and fill out membership details.
        </p>
        <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Neon Auth source: {sourceTable ?? "not found"} · candidates: {candidates.rows.length}
          {candidates.rows.length ? (
            <div className="mt-1 text-[11px] text-slate-500">
              {candidates.rows.map((row) => `${row.table_schema}.${row.table_name}`).join(", ")}
            </div>
          ) : null}
          {sourceError ? (
            <div className="mt-1 text-[11px] text-rose-600">
              {sourceError}
            </div>
          ) : null}
        </div>
        <div className="mt-4">
          {requested.length === 0 ? (
            <p className="text-sm text-slate-600">No new requests right now.</p>
          ) : (
            <MembersGrid entries={requested} />
          )}
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Approved members</h2>
        <div className="mt-4">
          {approved.length === 0 ? (
            <p className="text-sm text-slate-600">No approved members yet.</p>
          ) : (
            <MembersGrid entries={approved} />
          )}
        </div>
      </section>
    </div>
  );
}
