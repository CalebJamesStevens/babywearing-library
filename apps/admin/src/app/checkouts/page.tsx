import {
  carriers,
  carrierInstances,
  checkouts,
  db,
  members,
  sql,
} from "@babywearing/db";
import { eq } from "@babywearing/db";
import { revalidatePath } from "next/cache";
import FormField from "@/components/FormField";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

type NeonUserRow = {
  id: string;
  email: string | null;
  name: string | null;
};

export default async function CheckoutsPage() {
  await requireAdmin();
  const checkoutRows = await db
    .select({
      checkoutId: checkouts.id,
      status: checkouts.status,
      requestedAt: checkouts.requestedAt,
      approvedAt: checkouts.approvedAt,
      dueAt: checkouts.dueAt,
      requestedNotes: checkouts.requestedNotes,
      conditionBefore: checkouts.conditionBefore,
      approvedLengthDays: checkouts.approvedLengthDays,
      memberId: members.id,
      memberUserId: members.userId,
      memberContactEmail: members.contactEmail,
      carrierInstanceId: carrierInstances.id,
      carrierBrand: sql<string>`coalesce(${carrierInstances.brand}, ${carriers.brand})`,
      carrierModel: sql<string | null>`coalesce(${carrierInstances.model}, ${carriers.model})`,
      carrierSize: sql<string | null>`coalesce(${carrierInstances.size}, ${carriers.size})`,
      carrierType: sql<string>`coalesce(${carrierInstances.type}, ${carriers.type})`,
    })
    .from(checkouts)
    .leftJoin(members, eq(checkouts.memberId, members.id))
    .leftJoin(carrierInstances, eq(checkouts.carrierInstanceId, carrierInstances.id))
    .leftJoin(carriers, eq(carrierInstances.carrierId, carriers.id))
    .orderBy(checkouts.requestedAt);

  const candidates = await db.execute(
    sql<{ table_schema: string; table_name: string }>`
      select table_schema, table_name
      from information_schema.tables
      where table_name in ('users', 'user')
        and table_schema not in ('pg_catalog', 'information_schema')
      order by table_schema, table_name`
  );

  let neonUsers: { rows: NeonUserRow[] } = { rows: [] };
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
      const columnNames = columns.rows.map((column) => column.column_name);
      const emailExpr = columnNames.includes("email") ? `"email"` : "null as email";
      const nameExpr = columnNames.includes("name") ? `"name"` : "null as name";

      neonUsers = await db.execute(
        sql.raw(
          `select "id", ${emailExpr}, ${nameExpr} from "${candidate.table_schema}"."${candidate.table_name}"`
        ) as unknown as Parameters<typeof db.execute>[0]
      );
      break;
    } catch {
      // try next candidate
    }
  }

  const neonUsersById = new Map(neonUsers.rows.map((user) => [user.id, user]));

  async function approveCheckout(formData: FormData) {
    "use server";
    const checkoutId = String(formData.get("checkoutId") || "");
    const carrierInstanceId = String(formData.get("carrierInstanceId") || "");
    const lengthDays = Number(formData.get("approvedLengthDays") || 0);
    if (!checkoutId || !carrierInstanceId || !lengthDays) return;

    const now = new Date();
    const dueAt = new Date(now.getTime() + lengthDays * 24 * 60 * 60 * 1000);

    await db
      .update(checkouts)
      .set({
        status: "approved",
        approvedAt: now,
        dueAt,
        approvedLengthDays: lengthDays,
        conditionBefore: String(formData.get("conditionBefore") || "") || null,
        adminNotes: String(formData.get("adminNotes") || "") || null,
      })
      .where(eq(checkouts.id, checkoutId));

    await db
      .update(carrierInstances)
      .set({ status: "checked_out" })
      .where(eq(carrierInstances.id, carrierInstanceId));

    revalidatePath("/checkouts");
  }

  async function denyCheckout(formData: FormData) {
    "use server";
    const checkoutId = String(formData.get("checkoutId") || "");
    if (!checkoutId) return;

    await db
      .update(checkouts)
      .set({
        status: "denied",
        adminNotes: String(formData.get("adminNotes") || "") || null,
      })
      .where(eq(checkouts.id, checkoutId));

    revalidatePath("/checkouts");
  }

  async function markReturned(formData: FormData) {
    "use server";
    const checkoutId = String(formData.get("checkoutId") || "");
    const carrierInstanceId = String(formData.get("carrierInstanceId") || "");
    if (!checkoutId || !carrierInstanceId) return;

    await db
      .update(checkouts)
      .set({
        status: "returned",
        returnedAt: new Date(),
        conditionAfter: String(formData.get("conditionAfter") || "") || null,
      })
      .where(eq(checkouts.id, checkoutId));

    await db
      .update(carrierInstances)
      .set({ status: "available" })
      .where(eq(carrierInstances.id, carrierInstanceId));

    revalidatePath("/checkouts");
  }

  return (
    <div className="space-y-6">
      <section className="card-lg">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Checkouts</h1>
        <p className="mt-2 text-sm text-slate-600">
          Approve requests, track due dates, and close returns.
        </p>
      </section>

      <section className="card">
        <div className="!border-t !border-slate-300">
          {checkoutRows.length === 0 ? (
            <p className="py-4 text-sm text-slate-600">No checkout requests yet.</p>
          ) : (
            checkoutRows.map((checkout) => (
              <details key={checkout.checkoutId} className="!border-b !border-slate-300 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    {(() => {
                      const memberIdentity = checkout.memberUserId
                        ? neonUsersById.get(checkout.memberUserId)
                        : null;
                      const memberName = memberIdentity?.name?.trim() || "Member";
                      const memberEmail =
                        memberIdentity?.email?.trim() ||
                        checkout.memberContactEmail?.trim() ||
                        null;

                      return (
                        <>
                          <p className="text-sm font-semibold text-slate-900">
                            {[checkout.carrierBrand, checkout.carrierModel, checkout.carrierSize]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <p className="text-xs text-slate-500">
                            {checkout.carrierType}
                          </p>
                          <p className="text-xs text-slate-500">
                            {memberName}
                            {memberEmail && memberEmail !== memberName ? ` · ${memberEmail}` : ""}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      checkout.status === "pending"
                        ? "bg-amber-50 text-amber-700"
                        : checkout.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : checkout.status === "denied"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {checkout.status}
                  </span>
                </summary>

                {checkout.requestedNotes ? (
                  <p className="mt-3 text-sm text-slate-600">
                    Request notes: {checkout.requestedNotes}
                  </p>
                ) : null}

                {checkout.status === "pending" ? (
                  <form action={approveCheckout} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="checkoutId" value={checkout.checkoutId} />
                    <input type="hidden" name="carrierInstanceId" value={checkout.carrierInstanceId ?? ""} />
                    <FormField label="Checkout length (days)">
                      <input
                        name="approvedLengthDays"
                        type="number"
                        min="1"
                        placeholder="Checkout length (days)"
                        className="input"
                      />
                    </FormField>
                    <FormField label="Condition before checkout">
                      <textarea name="conditionBefore" placeholder="Condition before checkout" className="textarea h-20" />
                    </FormField>
                    <FormField label="Admin notes" className="sm:col-span-2">
                      <textarea name="adminNotes" placeholder="Admin notes" className="textarea h-20" />
                    </FormField>
                    <button className="btn-primary sm:col-span-2">
                      Approve checkout
                    </button>
                  </form>
                ) : null}

                {checkout.status === "pending" ? (
                  <form action={denyCheckout} className="mt-3">
                    <input type="hidden" name="checkoutId" value={checkout.checkoutId} />
                    <FormField label="Reason for denial">
                      <input name="adminNotes" placeholder="Reason for denial" className="input" />
                    </FormField>
                    <button className="btn-secondary mt-2">
                      Deny request
                    </button>
                  </form>
                ) : null}

                {checkout.status === "approved" ? (
                  <form action={markReturned} className="mt-4 grid gap-3">
                    <input type="hidden" name="checkoutId" value={checkout.checkoutId} />
                    <input type="hidden" name="carrierInstanceId" value={checkout.carrierInstanceId ?? ""} />
                    <FormField label="Condition after return">
                      <textarea name="conditionAfter" placeholder="Condition after return" className="textarea h-20" />
                    </FormField>
                    <button className="btn-primary">
                      Mark returned
                    </button>
                  </form>
                ) : null}
              </details>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
