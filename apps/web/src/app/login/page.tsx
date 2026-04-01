"use client";

import { AuthView } from "@neondatabase/auth/react";
import LinkButton from "@/components/LinkButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Member login</CardTitle>
        <CardDescription>
          Use your Neon account to access member checkout requests. You will need an
          active membership and a consultation or meetup visit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthView pathname="sign-in" />
      </CardContent>
      <CardFooter>
        <LinkButton href="/" variant="outline" size="lg" className="w-full">
          Back to library
        </LinkButton>
      </CardFooter>
    </Card>
  );
}
