"use client";

import { AuthView } from "@neondatabase/auth/react";

export default function AdminLoginPage() {
  return (
    <div className="card-lg max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin login</h1>
      <p className="mt-3 text-sm text-slate-600">
        Neon Auth will confirm your admin role before you can access the
        dashboard.
      </p>
      <div className="mt-6">
        <AuthView pathname="sign-in" />
      </div>
    </div>
  );
}
