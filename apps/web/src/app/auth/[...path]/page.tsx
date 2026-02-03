"use client";

import { AuthView } from "@neondatabase/auth/react";
import { useParams } from "next/navigation";

export default function WebAuthCatchAll() {
  const params = useParams();
  const path = params?.path;
  const pathname = Array.isArray(path) ? path[0] : path ?? "sign-in";
  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Member access</h1>
      <p className="mt-3 text-sm text-ink/70">
        Sign in with Neon Auth to request a carrier checkout.
      </p>
      <div className="mt-6">
        <AuthView pathname={pathname} />
      </div>
      <a
        href="/"
        className="mt-6 block rounded-full border border-ink/20 px-4 py-2 text-center text-sm text-ink"
      >
        Back to library
      </a>
    </div>
  );
}
