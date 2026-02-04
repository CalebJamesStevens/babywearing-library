import { db, carrierInstances, carriers, checkouts, members, reviews } from "@babywearing/db";
import { and, eq } from "@babywearing/db";
import { revalidatePath } from "next/cache";
import { CheckoutForm } from "@/components/CheckoutForm";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ instanceId: string }>;
};

export default async function CarrierDetailPage({ params }: PageProps) {
  const { data: session } = await auth.getSession();
  const { instanceId } = await params;

  const [row] = await db
    .select({
      instanceId: carrierInstances.id,
      instanceStatus: carrierInstances.status,
      instanceImage: carrierInstances.imageUrl,
      instanceMaterial: carrierInstances.material,
      instanceColorPattern: carrierInstances.colorPattern,
      conditionNotes: carrierInstances.conditionNotes,
      issues: carrierInstances.issues,
      carrierBrand: carriers.brand,
      carrierType: carriers.type,
      carrierModel: carriers.model,
      carrierDescription: carriers.description,
      carrierImage: carriers.imageUrl,
      videoUrl: carriers.videoUrl,
      safetyInfo: carriers.safetyInfo,
      safetyTests: carriers.safetyTests,
      recallInfo: carriers.recallInfo,
      manufacturerUrl: carriers.manufacturerUrl,
    })
    .from(carrierInstances)
    .leftJoin(carriers, eq(carrierInstances.carrierId, carriers.id))
    .where(eq(carrierInstances.id, instanceId));

  if (!row) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-ink/60">
        Carrier not found.
      </div>
    );
  }

  const activeCheckout = await db
    .select({ id: checkouts.id })
    .from(checkouts)
    .where(
      and(
        eq(checkouts.carrierInstanceId, instanceId),
        eq(checkouts.status, "approved")
      )
    )
    .limit(1);

  const available = row.instanceStatus === "available" && activeCheckout.length === 0;

  const member = session?.user?.id
    ? await db
        .select({ id: members.id, status: members.status })
        .from(members)
        .where(eq(members.userId, session.user.id))
        .limit(1)
    : [];

  const isActiveMember = member.length > 0 && member[0].status === "active";
  const pendingRequest = isActiveMember
    ? await db
        .select({ id: checkouts.id })
        .from(checkouts)
        .where(
          and(
            eq(checkouts.carrierInstanceId, instanceId),
            eq(checkouts.memberId, member[0].id),
            eq(checkouts.status, "pending")
          )
        )
        .limit(1)
    : [];
  const pendingRequestId = pendingRequest[0]?.id;
  const hasPendingRequest = Boolean(pendingRequestId);

  const reviewRows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.carrierInstanceId, instanceId));

  async function requestCheckout(formData: FormData) {
    "use server";
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) return;

    const memberRows = await db
      .select({ id: members.id, status: members.status })
      .from(members)
      .where(eq(members.userId, session.user.id))
      .limit(1);

    if (memberRows.length === 0 || memberRows[0].status !== "active") return;

    const existing = await db
      .select({ id: checkouts.id })
      .from(checkouts)
      .where(
        and(
          eq(checkouts.carrierInstanceId, instanceId),
          eq(checkouts.status, "approved")
        )
      )
      .limit(1);

    if (existing.length > 0) return;

    const requestedNotes = formData.get("notes");

    await db.insert(checkouts).values({
      carrierInstanceId: instanceId,
      memberId: memberRows[0].id,
      status: "pending",
      requestedNotes: typeof requestedNotes === "string" ? requestedNotes : null,
    });

    revalidatePath(`/carriers/${instanceId}`);
  }

  async function cancelCheckout(formData: FormData) {
    "use server";
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) return;

    const memberRows = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.userId, session.user.id))
      .limit(1);

    if (memberRows.length === 0) return;

    const checkoutId = String(formData.get("checkoutId") || "");
    if (!checkoutId) return;

    await db
      .update(checkouts)
      .set({ status: "canceled" })
      .where(eq(checkouts.id, checkoutId));

    revalidatePath(`/carriers/${instanceId}`);
  }

  return (
    <div className="space-y-8">
      <section className="card-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">
              {(row.carrierType ?? "carrier").replaceAll("_", " ").replace("meh dai", "meh dai /")}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {row.carrierBrand}
              {row.carrierModel ? ` ${row.carrierModel}` : ""}
            </h1>
            {row.instanceMaterial ? (
              <p className="mt-2 text-sm text-slate-600">
                Material: {row.instanceMaterial}
              </p>
            ) : null}
            {row.instanceColorPattern ? (
              <p className="mt-1 text-sm text-slate-600">
                Color / pattern: {row.instanceColorPattern}
              </p>
            ) : null}
            <p className="mt-3 text-sm text-slate-600">{row.carrierDescription}</p>
            {row.issues ? (
              <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Known issues: {row.issues}
              </p>
            ) : null}
            {row.conditionNotes ? (
              <p className="mt-3 text-sm text-slate-600">
                Condition notes: {row.conditionNotes}
              </p>
            ) : null}
          </div>
          <div className="rounded-md border border-slate-200 px-4 py-3 text-right">
            <p className="text-xs uppercase text-slate-500">Status</p>
            <p className="text-base font-semibold text-slate-900">
              {available ? "Available" : "Checked out"}
            </p>
          </div>
        </div>
        {(row.instanceImage || row.carrierImage) && (
          <div className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.instanceImage || row.carrierImage || ""}
              alt={`${row.carrierBrand} ${row.carrierModel ?? ""}`}
              className="h-64 w-full object-cover"
            />
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900">Safety guidance</h2>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>{row.safetyInfo || "Safety information will be added soon."}</p>
              {row.safetyTests ? (
                <p>Manufacturer tests: {row.safetyTests}</p>
              ) : null}
              {row.recallInfo ? (
                <p className="text-rose-700">Recalls: {row.recallInfo}</p>
              ) : (
                <p>No known recalls on file.</p>
              )}
              {row.manufacturerUrl ? (
                <p>
                  Manufacturer:{" "}
                  <a className="text-indigo-600 hover:text-indigo-700" href={row.manufacturerUrl}>
                    Visit site
                  </a>
                </p>
              ) : null}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
            {reviewRows.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No reviews yet.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {reviewRows.map((review) => (
                  <li key={review.id} className="rounded-md border border-slate-200 bg-white px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {"★".repeat(review.rating)}
                    </p>
                    <p className="mt-1">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900">Checkout</h2>
            {!session ? (
              <p className="mt-3 text-sm text-slate-600">
                You must be a member and logged in to request a checkout.
              </p>
            ) : !isActiveMember ? (
              <p className="mt-3 text-sm text-slate-600">
                Your membership is not active. Please update your membership to
                request a checkout.
              </p>
            ) : hasPendingRequest ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-amber-700">
                  Your request is being reviewed.
                </p>
                <form action={cancelCheckout}>
                  <input type="hidden" name="checkoutId" value={pendingRequestId} />
                  <button className="btn-secondary" type="submit">
                    Cancel request
                  </button>
                </form>
              </div>
            ) : null}

            {hasPendingRequest ? null : (
              <CheckoutForm
                action={requestCheckout}
                available={available}
                disabled={!session || !isActiveMember}
              />
            )}
          </div>

          {row.videoUrl ? (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900">How-to video</h2>
              <div className="mt-4 aspect-video overflow-hidden rounded-md border border-slate-200 bg-white">
                <iframe
                  src={row.videoUrl}
                  className="h-full w-full"
                  title="Carrier safety video"
                  allowFullScreen
                />
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
