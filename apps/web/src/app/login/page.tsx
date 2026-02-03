"use client";

import { AuthView } from "@neondatabase/auth/react";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Member login</h1>
      <p className="mt-3 text-sm text-ink/70">
        Use your Neon account to access member checkout requests. You will need
        an active membership and a consultation or meetup visit.
      </p>
      <div className="mt-6">
        <AuthView pathname="sign-in" />
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
