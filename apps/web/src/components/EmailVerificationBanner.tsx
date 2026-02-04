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
    <div className="card border-amber-200 bg-amber-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">
            Verify your email address
          </p>
          <p className="text-sm text-slate-700">
            {email} is not verified yet. Check your inbox or resend the
            verification email.
          </p>
        </div>
        <button
          className="btn-secondary border-amber-200 text-slate-900 hover:bg-amber-100"
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
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-900">
            Verification code
          </label>
          <input
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="Enter code"
            className="input"
          />
        </div>
        <button
          className="btn-primary h-10 self-end"
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
        <p className="mt-3 text-xs text-slate-600">
          Verification email sent. Check your inbox or spam folder.
        </p>
      ) : null}
      {status === "verified" ? (
        <p className="mt-3 text-xs text-emerald-700">
          Email verified. You may need to refresh to continue.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-3 text-xs text-rose-600">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </div>
  );
}
