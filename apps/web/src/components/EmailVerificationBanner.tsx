"use client";

import { useEffect, useState } from "react";
import { CircleAlertIcon, MailCheckIcon, ShieldCheckIcon } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function EmailVerificationBanner() {
  const [hasMounted, setHasMounted] = useState(false);
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "verifying" | "verified" | "error"
  >("idle");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const email = session?.user?.email;
  const emailVerified = session?.user?.emailVerified;

  if (!hasMounted || !email || emailVerified) return null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Alert>
          <CircleAlertIcon />
          <AlertTitle>Verify your email address</AlertTitle>
          <AlertDescription>
            {email} is not verified yet. Check your inbox or resend the verification
            email.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <FieldGroup className="flex-1">
            <Field>
              <FieldLabel htmlFor="verification-code">Verification code</FieldLabel>
              <Input
                id="verification-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter code"
              />
              <FieldDescription>
                Enter the code from your email to verify this account.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              disabled={status === "sending"}
              onClick={async () => {
                setStatus("sending");
                try {
                  await authClient.emailOtp.sendVerificationOtp({
                    email,
                    type: "email-verification",
                  });
                  setStatus("sent");
                  setTimeout(() => setStatus("idle"), 10000);
                } catch {
                  setStatus("error");
                }
              }}
            >
              {status === "sending" ? "Sending..." : "Resend email"}
            </Button>
            <Button
              size="lg"
              disabled={!otp || status === "verifying"}
              onClick={async () => {
                if (!otp) return;
                setStatus("verifying");
                try {
                  const result = await authClient.emailOtp.verifyEmail({
                    email,
                    otp,
                  });
                  if (result.data?.status) {
                    setStatus("verified");
                  } else {
                    setStatus("error");
                  }
                } catch {
                  setStatus("error");
                }
              }}
            >
              {status === "verifying" ? "Verifying..." : "Verify code"}
            </Button>
          </div>
        </div>

        {status === "sent" ? (
          <Alert>
            <MailCheckIcon />
            <AlertTitle>Verification email sent</AlertTitle>
            <AlertDescription>
              Check your inbox or spam folder for the latest code.
            </AlertDescription>
          </Alert>
        ) : null}
        {status === "verified" ? (
          <Alert>
            <ShieldCheckIcon />
            <AlertTitle>Email verified</AlertTitle>
            <AlertDescription>You may need to refresh to continue.</AlertDescription>
          </Alert>
        ) : null}
        {status === "error" ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Verification failed</AlertTitle>
            <AlertDescription>Something went wrong. Please try again.</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
