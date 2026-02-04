"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type SessionResponse = {
  session: {
    id: string;
    token: string;
    userId: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    role?: string | null;
  };
};

export default function SessionNav() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/get-session", { cache: "no-store" });
      const data = await response.json();
      if (data?.user) {
        setSession(data as SessionResponse);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [pathname, refreshSession]);

  useEffect(() => {
    if (session?.user) return;
    const interval = setInterval(() => {
      refreshSession();
    }, 3000);
    return () => clearInterval(interval);
  }, [session?.user, refreshSession]);

  if (loading) {
    return (
      <button className="btn-secondary" type="button" disabled>
        Loading…
      </button>
    );
  }

  if (!session?.user) {
    return (
      <a className="btn-primary" href="/login">
        Member Login
      </a>
    );
  }

  return (
    <button
      className="btn-secondary"
      type="button"
      onClick={async () => {
        await fetch("/api/auth/sign-out", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        refreshSession();
      }}
    >
      Sign out
    </button>
  );
}
