"use client";

import { AuthView } from "@neondatabase/auth/react";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Admin login</h1>
      <p className="mt-3 text-sm text-ink/70">
        Neon Auth will confirm your admin role before you can access the
        dashboard.
      </p>
      <div className="mt-6">
        <AuthView pathname="sign-in" />
      </div>
    </div>
  );
}
