"use client";

import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth/client";
import LinkButton from "@/components/LinkButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionNav() {
  const [hasMounted, setHasMounted] = useState(false);
  const { data: session, isPending, refetch } = useSession();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || isPending) {
    return <Skeleton className="h-9 w-28 rounded-lg" />;
  }

  if (!session?.user) {
    return (
      <LinkButton href="/login" size="lg" className="w-full justify-center sm:w-auto">
        Member Login
      </LinkButton>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full justify-center sm:w-auto"
      onClick={async () => {
        await authClient.signOut();
        await refetch();
      }}
    >
      Sign out
    </Button>
  );
}
