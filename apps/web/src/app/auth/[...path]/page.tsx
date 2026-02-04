"use client";

import { AuthView } from "@neondatabase/auth/react";
import { useParams } from "next/navigation";

export default function WebAuthCatchAll() {
  const params = useParams();
  const path = params?.path;
  const pathname = Array.isArray(path) ? path[0] : path ?? "sign-in";
  return (
    <div className="card-lg max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Member access
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        Sign in with Neon Auth to request a carrier checkout.
      </p>
      <div className="mt-6">
        <AuthView pathname={pathname} />
      </div>
      <a
        href="/"
        className="btn-secondary mt-6 w-full"
      >
        Back to library
      </a>
    </div>
  );
}
