"use client";

import { useEffect, useState } from "react";

type SessionResponse = {
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
};

export default function HomeHero() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  console.log(session);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/get-session", { cache: "no-store" });
        const data = await response.json();
        if (!cancelled) {
          setSession(data);
        }
      } catch {
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isLoggedIn = Boolean(session?.user);

  return (
    <section className="card-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Explore babywearing carriers
          </h1>
          <p className="text-sm text-slate-600">
            Membership is $30/year and requires a consultation with our
            educator or a library meetup visit.
          </p>
          {!isLoggedIn && !loading ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <a className="btn-primary" href="/login">
                Become a member
              </a>
              <a className="btn-secondary" href="/login">
                Member login
              </a>
            </div>
          ) : null}
          {isLoggedIn && !loading ? (
            <p className="text-sm text-emerald-700">
              You&apos;re signed in. Browse the library and request a checkout.
            </p>
          ) : null}
        </div>
        {!isLoggedIn && !loading ? (
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            Questions? Email your librarian after logging in to request a
            checkout.
          </div>
        ) : null}
      </div>
    </section>
  );
}
