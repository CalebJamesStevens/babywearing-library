import { db, carrierInstances, carriers, checkouts, members, reviews } from "@babywearing/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CheckoutForm } from "@/components/CheckoutForm";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { instanceId: string };
};

export default async function CarrierDetailPage({ params }: PageProps) {
  const { data: session } = await auth.getSession();
  const instanceId = params.instanceId;

  const [row] = await db
    .select({
      instanceId: carrierInstances.id,
      instanceStatus: carrierInstances.status,
      instanceImage: carrierInstances.imageUrl,
      conditionNotes: carrierInstances.conditionNotes,
      issues: carrierInstances.issues,
      carrierBrand: carriers.brand,
      carrierType: carriers.type,
      carrierModel: carriers.model,
      carrierMaterial: carriers.material,
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

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase text-ink/50">
              {row.carrierType}
            </p>
            <h1 className="text-3xl font-semibold text-ink">
              {row.carrierBrand}
              {row.carrierModel ? ` ${row.carrierModel}` : ""}
            </h1>
            {row.carrierMaterial ? (
              <p className="mt-2 text-sm text-ink/60">
                Material: {row.carrierMaterial}
              </p>
            ) : null}
            <p className="mt-3 text-ink/70">{row.carrierDescription}</p>
            {row.issues ? (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Known issues: {row.issues}
              </p>
            ) : null}
            {row.conditionNotes ? (
              <p className="mt-3 text-sm text-ink/60">
                Condition notes: {row.conditionNotes}
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-ink/10 px-4 py-3 text-right">
            <p className="text-xs uppercase text-ink/50">Status</p>
            <p className="text-lg font-semibold text-ink">
              {available ? "Available" : "Checked out"}
            </p>
          </div>
        </div>
        {(row.instanceImage || row.carrierImage) && (
          <div className="mt-6 overflow-hidden rounded-2xl bg-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.instanceImage || row.carrierImage || ""}
              alt={`${row.carrierBrand} ${row.carrierModel ?? ""}`}
              className="h-72 w-full object-cover"
            />
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Safety guidance</h2>
            <div className="mt-3 space-y-3 text-sm text-ink/70">
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
                  Manufacturer: <a href={row.manufacturerUrl}>Visit site</a>
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Reviews</h2>
            {reviewRows.length === 0 ? (
              <p className="mt-3 text-sm text-ink/60">No reviews yet.</p>
            ) : (
              <ul className="mt-4 space-y-4 text-sm text-ink/70">
                {reviewRows.map((review) => (
                  <li key={review.id} className="rounded-xl bg-sand px-4 py-3">
                    <p className="font-medium text-ink">
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
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Checkout</h2>
            {!session ? (
              <p className="mt-3 text-sm text-ink/70">
                You must be a member and logged in to request a checkout.
              </p>
            ) : !isActiveMember ? (
              <p className="mt-3 text-sm text-ink/70">
                Your membership is not active. Please update your membership to
                request a checkout.
              </p>
            ) : null}

            <CheckoutForm
              action={requestCheckout}
              available={available}
              disabled={!session || !isActiveMember}
            />
          </div>

          {row.videoUrl ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-ink">How-to video</h2>
              <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-sand">
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
