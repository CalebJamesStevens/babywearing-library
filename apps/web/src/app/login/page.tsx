"use client";

import { AuthView } from "@neondatabase/auth/react";

export default function LoginPage() {
  return (
    <div className="card-lg max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Member login
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        Use your Neon account to access member checkout requests. You will need
        an active membership and a consultation or meetup visit.
      </p>
      <div className="mt-6">
        <AuthView pathname="sign-in" />
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
