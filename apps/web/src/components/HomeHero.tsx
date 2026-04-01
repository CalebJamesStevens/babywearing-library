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
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Explore carriers
          </h1>
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
        </div>
        <div className="text-sm text-slate-600">
          Questions? Email Hannah at <a href="mailto:hannah@babysbreathbw.com" className="text-blue-500 underline">hannah@babysbreathbw.com</a>.
        </div>
      </div>
    </section>
  );
}
