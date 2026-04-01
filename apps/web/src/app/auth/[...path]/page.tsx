"use client";

import { AuthView } from "@neondatabase/auth/react";
import { useParams } from "next/navigation";
import LinkButton from "@/components/LinkButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WebAuthCatchAll() {
  const params = useParams();
  const path = params?.path;
  const pathname = Array.isArray(path) ? path[0] : path ?? "sign-in";
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Member access</CardTitle>
        <CardDescription>
          Sign in with Neon Auth to request a carrier checkout.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthView pathname={pathname} />
      </CardContent>
      <CardFooter>
        <LinkButton href="/" variant="outline" size="lg" className="w-full">
          Back to library
        </LinkButton>
      </CardFooter>
    </Card>
  );
}
