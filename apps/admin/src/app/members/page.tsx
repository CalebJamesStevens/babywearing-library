import { db, members } from "@babywearing/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  await requireAdmin();
  const memberRows = await db.select().from(members).orderBy(members.createdAt);

  async function addMember(formData: FormData) {
    "use server";
    const userId = String(formData.get("userId") || "").trim();
    if (!userId) return;

    await db.insert(members).values({
      userId,
      status: String(formData.get("status") || "active") as
        | "active"
        | "inactive"
        | "expired"
        | "suspended",
      lastPaidAt: formData.get("lastPaidAt")
        ? new Date(String(formData.get("lastPaidAt")))
        : null,
      paymentType: (String(formData.get("paymentType") || "") || null) as
        | "cash"
        | "card"
        | "venmo"
        | "paypal"
        | "other"
        | null,
      contactEmail: String(formData.get("contactEmail") || "") || null,
      contactPhone: String(formData.get("contactPhone") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    });

    revalidatePath("/members");
  }

  async function updateMember(formData: FormData) {
    "use server";
    const memberId = String(formData.get("memberId") || "");
    if (!memberId) return;

    await db
      .update(members)
      .set({
        status: String(formData.get("status") || "active") as
          | "active"
          | "inactive"
          | "expired"
          | "suspended",
        lastPaidAt: formData.get("lastPaidAt")
          ? new Date(String(formData.get("lastPaidAt")))
          : null,
        paymentType: (String(formData.get("paymentType") || "") || null) as
          | "cash"
          | "card"
          | "venmo"
          | "paypal"
          | "other"
          | null,
        contactEmail: String(formData.get("contactEmail") || "") || null,
        contactPhone: String(formData.get("contactPhone") || "") || null,
        notes: String(formData.get("notes") || "") || null,
      })
      .where(eq(members.id, memberId));

    revalidatePath("/members");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Members</h1>
        <p className="mt-2 text-sm text-ink/60">
          Track Neon users, membership status, and payment history.
        </p>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Add member</h2>
        <form action={addMember} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="userId" placeholder="Neon user id" className="input" />
          <select name="status" className="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
          <input name="lastPaidAt" type="date" className="input" />
          <select name="paymentType" className="input">
            <option value="">Payment type</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="venmo">Venmo</option>
            <option value="paypal">PayPal</option>
            <option value="other">Other</option>
          </select>
          <input name="contactEmail" placeholder="Email" className="input" />
          <input name="contactPhone" placeholder="Phone" className="input" />
          <textarea name="notes" placeholder="Notes" className="input h-20 md:col-span-2" />
          <button className="rounded-full bg-lake px-4 py-2 text-sm font-semibold text-white md:col-span-2">
            Add member
          </button>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Current members</h2>
        <div className="mt-4 space-y-4">
          {memberRows.length === 0 ? (
            <p className="text-sm text-ink/60">No members yet.</p>
          ) : (
            memberRows.map((member) => (
              <div key={member.id} className="rounded-2xl border border-ink/10 p-4">
                <p className="text-sm font-semibold text-ink">{member.userId}</p>
                <form action={updateMember} className="mt-3 grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="memberId" value={member.id} />
                  <select name="status" defaultValue={member.status} className="input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <input
                    name="lastPaidAt"
                    type="date"
                    defaultValue={member.lastPaidAt ? new Date(member.lastPaidAt).toISOString().slice(0, 10) : ""}
                    className="input"
                  />
                  <select name="paymentType" defaultValue={member.paymentType ?? ""} className="input">
                    <option value="">Payment type</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="venmo">Venmo</option>
                    <option value="paypal">PayPal</option>
                    <option value="other">Other</option>
                  </select>
                  <input name="contactEmail" defaultValue={member.contactEmail ?? ""} placeholder="Email" className="input" />
                  <input name="contactPhone" defaultValue={member.contactPhone ?? ""} placeholder="Phone" className="input" />
                  <textarea name="notes" defaultValue={member.notes ?? ""} placeholder="Notes" className="input h-20 md:col-span-2" />
                  <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white md:col-span-2">
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
