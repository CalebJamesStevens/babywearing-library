import "./globals.css";
import "@neondatabase/auth/ui/css";
import type { ReactNode } from "react";
import AuthProvider from "@/components/AuthProvider";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata = {
  title: "Babywearing Library",
  description: "Carrier library for wraps, structured carriers, and ring slings.",
  manifest: "/manifest.webmanifest",
  themeColor: "#4f46e5",
};

const navLink = "text-sm uppercase tracking-wide text-ink hover:text-clay";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
        <div className="min-h-screen">
          <header className="border-b border-ink/10 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
              <div>
                <p className="text-lg font-semibold text-ink">
                  Babywearing Carrier Library
                </p>
                <p className="text-xs text-ink/60">
                  Member-supported, $30/year with consultation or meetup
                </p>
              </div>
              <nav className="flex items-center gap-6">
                <a className={navLink} href="/">
                  Library
                </a>
                <a className={navLink} href="/login">
                  Member Login
                </a>
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
