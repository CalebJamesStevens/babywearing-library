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
};

export const viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
        <div className="min-h-[100dvh] sm:min-h-screen flex flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="container-app flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">Library Admin</p>
                <p className="text-xs text-slate-500">Inventory and membership control</p>
              </div>
              <nav className="flex flex-wrap gap-2">
                <a className="btn-ghost" href="/">Dashboard</a>
                <a className="btn-ghost" href="/inventory">Inventory</a>
                <a className="btn-ghost" href="/members">Members</a>
                <a className="btn-ghost" href="/checkouts">Checkouts</a>
              </nav>
            </div>
          </header>
          <main className="container-app flex-1 space-y-6 overflow-y-auto py-6 pb-6 sm:overflow-visible">
            <EmailVerificationBanner />
            {children}
          </main>
        </div>
        <nav className="static z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
          <div className="container-app grid grid-cols-4 gap-1 py-2 text-center text-xs">
            <a className="btn-ghost w-full justify-center" href="/">Dashboard</a>
            <a className="btn-ghost w-full justify-center" href="/inventory">Inventory</a>
            <a className="btn-ghost w-full justify-center" href="/members">Members</a>
            <a className="btn-ghost w-full justify-center" href="/checkouts">Checkouts</a>
          </div>
        </nav>
        <ServiceWorker />
        </AuthProvider>
      </body>
    </html>
  );
}
