import LinkButton from "@/components/LinkButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/server";

export default async function HomeHero() {
  const { data: session } = await auth.getSession();
  const isLoggedIn = Boolean(session?.user);

  return (
    <Card className="border border-primary">
      <CardHeader>
        <CardTitle className="text-3xl leading-tight sm:text-2xl">Explore carriers</CardTitle>
        <CardDescription className="max-w-2xl text-base leading-relaxed sm:text-sm">
          Browse the library inventory, check availability, and request a checkout once
          your membership is active.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        {!isLoggedIn ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <LinkButton href="/login" size="lg">
              Become a member
            </LinkButton>
            <LinkButton href="/login" variant="outline" size="lg">
              Member login
            </LinkButton>
          </div>
        ) : (
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-sm">
            You&apos;re signed in. Open any carrier to request a checkout.
          </p>
        )}
        <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-sm">
          Questions? Email{" "}
          <a href="mailto:hannah@babysbreathbw.com" className="underline underline-offset-4">
            hannah@babysbreathbw.com
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}
