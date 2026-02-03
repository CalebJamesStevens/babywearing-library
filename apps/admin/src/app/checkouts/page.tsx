import {
  carriers,
  carrierInstances,
  checkouts,
  db,
  members,
} from "@babywearing/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

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
      carrierInstanceId: carrierInstances.id,
      carrierBrand: carriers.brand,
      carrierModel: carriers.model,
      carrierType: carriers.type,
    })
    .from(checkouts)
    .leftJoin(members, eq(checkouts.memberId, members.id))
    .leftJoin(carrierInstances, eq(checkouts.carrierInstanceId, carrierInstances.id))
    .leftJoin(carriers, eq(carrierInstances.carrierId, carriers.id))
    .orderBy(checkouts.requestedAt);

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
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Checkouts</h1>
        <p className="mt-2 text-sm text-ink/60">
          Approve requests, track due dates, and close returns.
        </p>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {checkoutRows.length === 0 ? (
            <p className="text-sm text-ink/60">No checkout requests yet.</p>
          ) : (
            checkoutRows.map((checkout) => (
              <div key={checkout.checkoutId} className="rounded-2xl border border-ink/10 p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {checkout.carrierBrand} {checkout.carrierModel ?? ""}
                    </p>
                    <p className="text-xs text-ink/60">
                      {checkout.carrierType} · Member {checkout.memberUserId}
                    </p>
                  </div>
                  <span className="text-xs uppercase text-ink/50">{checkout.status}</span>
                </div>

                {checkout.requestedNotes ? (
                  <p className="mt-2 text-sm text-ink/70">
                    Request notes: {checkout.requestedNotes}
                  </p>
                ) : null}

                {checkout.status === "pending" ? (
                  <form action={approveCheckout} className="mt-4 grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="checkoutId" value={checkout.checkoutId} />
                    <input type="hidden" name="carrierInstanceId" value={checkout.carrierInstanceId} />
                    <input
                      name="approvedLengthDays"
                      type="number"
                      min="1"
                      placeholder="Checkout length (days)"
                      className="input"
                    />
                    <textarea name="conditionBefore" placeholder="Condition before checkout" className="input h-20" />
                    <textarea name="adminNotes" placeholder="Admin notes" className="input h-20 md:col-span-2" />
                    <button className="rounded-full bg-lake px-4 py-2 text-sm font-semibold text-white md:col-span-2">
                      Approve checkout
                    </button>
                  </form>
                ) : null}

                {checkout.status === "pending" ? (
                  <form action={denyCheckout} className="mt-3">
                    <input type="hidden" name="checkoutId" value={checkout.checkoutId} />
                    <input name="adminNotes" placeholder="Reason for denial" className="input" />
                    <button className="mt-2 rounded-full border border-ink/20 px-4 py-2 text-sm">
                      Deny request
                    </button>
                  </form>
                ) : null}

                {checkout.status === "approved" ? (
                  <form action={markReturned} className="mt-4 grid gap-3">
                    <input type="hidden" name="checkoutId" value={checkout.checkoutId} />
                    <input type="hidden" name="carrierInstanceId" value={checkout.carrierInstanceId} />
                    <textarea name="conditionAfter" placeholder="Condition after return" className="input h-20" />
                    <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
                      Mark returned
                    </button>
                  </form>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
