import "./globals.css";
import "@neondatabase/auth/ui/css";
import type { ReactNode } from "react";
import AuthProvider from "@/components/AuthProvider";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata = {
  title: "Library Admin",
  description: "Admin tools for the babywearing carrier library.",
  manifest: "/manifest.webmanifest",
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
        <div className="min-h-screen">
          <header className="border-b border-ink/10 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
              <div>
                <p className="text-lg font-semibold text-ink">Library Admin</p>
                <p className="text-xs text-ink/60">Inventory and membership control</p>
              </div>
              <nav className="flex items-center gap-6">
                <a href="/">Dashboard</a>
                <a href="/inventory">Inventory</a>
                <a href="/members">Members</a>
                <a href="/checkouts">Checkouts</a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">
            <EmailVerificationBanner />
            {children}
          </main>
        </div>
        <ServiceWorker />
        </AuthProvider>
      </body>
    </html>
  );
}
