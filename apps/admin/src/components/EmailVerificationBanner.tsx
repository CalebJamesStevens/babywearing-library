"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="mb-8 overflow-hidden rounded-2xl border-2 border-blue-200 !bg-slate-50 shadow-xl">
      <div className="h-2 !bg-blue-600 w-full" />
      
      <div className="flex flex-col md:flex-row items-center gap-6 p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full !bg-blue-600 !text-white shadow-md">
          <Mail className="h-7 w-7" />
        </div>
        
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h3 className="text-xl font-bold !text-slate-900">
              Verify your email address
            </h3>
            <p className="text-sm !text-slate-700">
              Check <span className="font-bold !text-blue-700 underline">{email}</span> for your code.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label htmlFor="otp-input" className="block text-xs font-black uppercase tracking-widest !text-slate-500">
                Enter 6-Digit Code
              </label>
              <input
                id="otp-input"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full rounded-lg border-2 !border-slate-300 !bg-white px-4 py-3 text-lg font-mono font-bold !text-slate-900 placeholder:text-slate-400 focus:!border-blue-600 focus:outline-none transition-all shadow-inner"
                maxLength={6}
              />
            </div>
            
            <div className="flex gap-2 h-[52px]">
              <button
                className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg !bg-blue-600 px-8 text-sm font-black !text-white transition-all hover:!bg-blue-700 active:scale-95 shadow-md"
                disabled={otp.length !== 6 || status === "verifying"}
                onClick={async () => {
                  setStatus("verifying");
                  try {
                    const result = await authClient.emailOtp.verifyEmail({ email, otp });
                    if (result.data?.status) setStatus("verified");
                    else setStatus("error");
                  } catch { setStatus("error"); }
                }}
              >
                {status === "verifying" ? <Loader2 className="h-5 w-5 animate-spin" /> : "VERIFY NOW"}
              </button>
              
              <button
                className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg border-2 !border-slate-400 !bg-slate-200 px-5 text-sm font-black !text-slate-800 transition-all hover:!bg-slate-300 active:scale-95"
                disabled={status === "sending"}
                onClick={async () => {
                  setStatus("sending");
                  try {
                    await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
                    setStatus("sent");
                    setTimeout(() => setStatus("idle"), 10000);
                  } catch { setStatus("error"); }
                }}
              >
                {status === "sending" ? "SENDING..." : "RESEND"}
              </button>
            </div>
          </div>

          {/* Bold Status Banners */}
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-lg !bg-red-600 px-4 py-3 text-sm font-bold !text-white animate-bounce">
              <AlertCircle className="h-5 w-5" />
              <span>INVALID CODE. PLEASE TRY AGAIN.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}