"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export default function EmailVerificationBanner() {
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "verifying" | "verified" | "error"
  >("idle");
  const [otp, setOtp] = useState("");

  const email = session?.user?.email;
  const emailVerified = session?.user?.emailVerified;

  if (!email || emailVerified) return null;

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold">Verify your email address</p>
          <p className="text-sm text-amber-800/80">
            {email} is not verified yet. Check your inbox or resend the
            verification email.
          </p>
        </div>
        <button
          className="rounded-full bg-amber-900 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-800"
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
          {status === "sending" ? "Sending..." : "Resend verification"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          placeholder="Enter verification code"
          className="w-full rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-amber-900 placeholder:text-amber-400"
        />
        <button
          className="rounded-full bg-amber-700 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600"
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
        </button>
      </div>

      {status === "sent" ? (
        <p className="mt-3 text-xs text-amber-900">
          Verification email sent. Check your inbox or spam folder.
        </p>
      ) : null}
      {status === "verified" ? (
        <p className="mt-3 text-xs text-amber-900">
          Email verified. You may need to refresh to continue.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-3 text-xs text-amber-900">
          Something went wrong. Please try again later.
        </p>
      ) : null}
    </div>
  );
}
