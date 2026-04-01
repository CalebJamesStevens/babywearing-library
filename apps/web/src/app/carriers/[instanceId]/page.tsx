import { db, carrierInstances, carriers, checkouts, members, reviews, sql } from "@babywearing/db";
import { and, eq } from "@babywearing/db";
import { revalidatePath } from "next/cache";
import { CircleAlertIcon, CircleCheckIcon, ExternalLinkIcon, Image as ImageIcon } from "lucide-react";
import { CheckoutForm } from "@/components/CheckoutForm";
import LinkButton from "@/components/LinkButton";
import { auth } from "@/lib/auth/server";
import {
  buildCarrierName,
  formatAvailabilityStatus,
  formatCarrierType,
  getAvailabilityBadgeVariant,
} from "@/lib/carriers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";

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
      carrierBrand: sql<string>`coalesce(${carrierInstances.brand}, ${carriers.brand})`,
      carrierType: sql<string>`coalesce(${carrierInstances.type}, ${carriers.type})`,
      carrierModel: sql<string | null>`coalesce(${carrierInstances.model}, ${carriers.model})`,
      carrierSize: sql<string | null>`coalesce(${carrierInstances.size}, ${carriers.size})`,
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
      <Empty className="border bg-card py-12">
        <EmptyHeader>
          <EmptyTitle>Carrier not found</EmptyTitle>
          <EmptyDescription>
            This carrier record is missing or no longer available in the library.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <LinkButton href="/" variant="outline" size="lg">
            Back to library
          </LinkButton>
        </EmptyContent>
      </Empty>
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
  const availabilityStatus =
    row.instanceStatus === "maintenance" || row.instanceStatus === "retired"
      ? row.instanceStatus
      : available
        ? "available"
        : "checked_out";
  const carrierName = buildCarrierName({
    brand: row.carrierBrand,
    model: row.carrierModel,
    size: row.carrierSize,
  });
  const imageUrl = row.instanceImage || row.carrierImage;

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
    <div className="flex flex-col gap-8">
      <Card className="pt-0">
        {imageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={carrierName}
              className="h-[456px] w-full bg-muted/30 object-contain"
            />
            <Separator />
          </>
        )}
        <CardHeader>
          <CardDescription>{formatCarrierType(row.carrierType)}</CardDescription>
          <CardTitle className="text-2xl">{carrierName}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getAvailabilityBadgeVariant(availabilityStatus)}>
              {formatAvailabilityStatus(availabilityStatus)}
            </Badge>
            {row.carrierSize ? <Badge variant="outline">Size {row.carrierSize}</Badge> : null}
            {row.instanceMaterial ? <Badge variant="outline">{row.instanceMaterial}</Badge> : null}
            {imageUrl ? (
              <Badge variant="outline">
                <ImageIcon data-icon="inline-start" />
                Photo available
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {row.carrierDescription ? (
            <p className="text-sm text-muted-foreground">{row.carrierDescription}</p>
          ) : null}
          {row.instanceColorPattern ? (
            <p className="text-sm text-muted-foreground">
              Color / pattern: {row.instanceColorPattern}
            </p>
          ) : null}
          {row.conditionNotes ? (
            <p className="text-sm text-muted-foreground">
              Condition notes: {row.conditionNotes}
            </p>
          ) : null}
          {row.issues ? (
            <Alert>
              <CircleAlertIcon />
              <AlertTitle>Known issues</AlertTitle>
              <AlertDescription>{row.issues}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex flex-col gap-6">
            {(row.safetyInfo || row.safetyTests) && (
          <Card>
            <CardHeader>
              <CardTitle>Safety guidance</CardTitle>
              <CardDescription>
                Review the current safety notes before requesting this carrier.
              </CardDescription>
            </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
                <p>{row.safetyInfo || "Safety information will be added soon."}</p>
                {row.safetyTests ? <p>Manufacturer tests: {row.safetyTests}</p> : null}
              </CardContent>
            {row.manufacturerUrl ? (
              <CardFooter>
                <LinkButton
                  href={row.manufacturerUrl}
                  variant="outline"
                  size="lg"
                  className="w-full"
                  external
                >
                  <ExternalLinkIcon data-icon="inline-start" />
                  Visit manufacturer site
                </LinkButton>
              </CardFooter>
            ) : null}
          </Card>
            )}

          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>Feedback from library members.</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewRows.length === 0 ? (
                <Empty className="border bg-muted/30 py-10">
                  <EmptyHeader>
                    <EmptyTitle>No reviews yet</EmptyTitle>
                    <EmptyDescription>
                      Be the first member to share feedback after a checkout.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="flex flex-col gap-3">
                  {reviewRows.map((review) => (
                    <Card key={review.id} size="sm">
                      <CardHeader>
                        <CardTitle>{"★".repeat(review.rating)}</CardTitle>
                        <CardDescription>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>
                Requests are reviewed by the library after your membership is confirmed.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {!session ? (
                <Alert>
                  <CircleAlertIcon />
                  <AlertTitle>Sign in required</AlertTitle>
                  <AlertDescription>
                    You must be a member and logged in to request a checkout.
                  </AlertDescription>
                </Alert>
              ) : !isActiveMember ? (
                <Alert>
                  <CircleAlertIcon />
                  <AlertTitle>Membership inactive</AlertTitle>
                  <AlertDescription>
                    Update your membership before requesting a checkout.
                  </AlertDescription>
                </Alert>
              ) : hasPendingRequest ? (
                <>
                  <Alert>
                    <CircleAlertIcon />
                    <AlertTitle>Request in review</AlertTitle>
                    <AlertDescription>
                      Your checkout request is currently being reviewed.
                    </AlertDescription>
                  </Alert>
                  <form action={cancelCheckout}>
                    <input type="hidden" name="checkoutId" value={pendingRequestId} />
                    <Button type="submit" variant="outline" size="lg">
                      Cancel request
                    </Button>
                  </form>
                </>
              ) : null}

              {hasPendingRequest ? null : (
                <CheckoutForm
                  action={requestCheckout}
                  available={available}
                  disabled={!session || !isActiveMember}
                />
              )}
            </CardContent>
          </Card>

          {row.videoUrl ? (
            <Card>
              <CardHeader>
                <CardTitle>How-to video</CardTitle>
                <CardDescription>Watch the manufacturer or safety walkthrough.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-xl border">
                  <iframe
                    src={row.videoUrl}
                    className="aspect-video w-full"
                    title="Carrier safety video"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
