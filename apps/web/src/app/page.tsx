import { db, carrierInstances, carriers, checkouts } from "@babywearing/db";
import { and, eq } from "@babywearing/db";
import HomeHero from "@/components/HomeHero";

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
    <div className="space-y-6">
      <HomeHero />

      <section className="grid gap-4 sm:grid-cols-2">
        {rows.length === 0 ? (
          <div className="card text-center text-slate-600">
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
                className="card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase text-slate-500">
                      {(row.carrierType ?? "carrier")
                        .replaceAll("_", " ")
                        .replace("meh dai", "meh dai /")}
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {row.carrierBrand}
                      {row.carrierModel ? ` ${row.carrierModel}` : ""}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
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
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        available
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {available ? "Available" : "Checked out"}
                    </span>
                  </div>
                </div>
                {image ? (
                  <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={`${row.carrierBrand} ${row.carrierModel ?? ""}`}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="mt-4 flex">
                  <a
                    className="btn-secondary w-full justify-center"
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
