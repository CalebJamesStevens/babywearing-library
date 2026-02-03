import { db, carrierInstances, carriers, checkouts } from "@babywearing/db";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await db
    .select({
      instanceId: carrierInstances.id,
      instanceStatus: carrierInstances.status,
      instanceImage: carrierInstances.imageUrl,
      issues: carrierInstances.issues,
      carrierBrand: carriers.brand,
      carrierType: carriers.type,
      carrierModel: carriers.model,
      carrierImage: carriers.imageUrl,
      checkoutId: checkouts.id,
    })
    .from(carrierInstances)
    .leftJoin(carriers, eq(carrierInstances.carrierId, carriers.id))
    .leftJoin(
      checkouts,
      and(
        eq(checkouts.carrierInstanceId, carrierInstances.id),
        eq(checkouts.status, "approved")
      )
    );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink">
              Explore babywearing carriers
            </h1>
            <p className="mt-2 text-ink/70">
              Membership is $30/year and requires a consultation with our
              educator or a library meetup visit.
            </p>
          </div>
          <div className="rounded-2xl bg-sand px-5 py-3 text-sm text-ink/70">
            Questions? Email your librarian after logging in to request a
            checkout.
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/60">
            No carriers yet. Add inventory in the admin app.
          </div>
        ) : (
          rows.map((row) => {
            const available =
              row.instanceStatus === "available" && !row.checkoutId;
            const image = row.instanceImage || row.carrierImage;
            return (
              <article
                key={row.instanceId}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
            <p className="text-xs uppercase text-ink/50">
              {row.carrierType
                .replaceAll("_", " ")
                .replace("meh dai", "meh dai /")}
            </p>
                    <h2 className="text-xl font-semibold text-ink">
                      {row.carrierBrand}
                      {row.carrierModel ? ` ${row.carrierModel}` : ""}
                    </h2>
                    <p className="mt-2 text-sm text-ink/60">
                      {available ? "Available now" : "Currently checked out"}
                    </p>
                    {row.issues ? (
                      <p className="mt-3 text-sm text-amber-700">
                        Known issues: {row.issues}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        available
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {available ? "Available" : "Checked out"}
                    </span>
                  </div>
                </div>
                {image ? (
                  <div className="mt-4 overflow-hidden rounded-xl bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={`${row.carrierBrand} ${row.carrierModel ?? ""}`}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="mt-6">
                  <a
                    className="inline-flex items-center rounded-full border border-ink/20 px-4 py-2 text-sm text-ink"
                    href={`/carriers/${row.instanceId}`}
                  >
                    View details
                  </a>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
