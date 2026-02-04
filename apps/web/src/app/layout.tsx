import "./globals.css";
import "@neondatabase/auth/ui/css";
import type { ReactNode } from "react";
import AuthProvider from "@/components/AuthProvider";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import ServiceWorker from "@/components/ServiceWorker";
import SessionNav from "@/components/SessionNav";

export const metadata = {
  title: "Babywearing Library",
  description: "Carrier library for wraps, structured carriers, and ring slings.",
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
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="container-app flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">
                  Babywearing Library
                </p>
                <p className="text-xs text-slate-500">
                  Member-supported, $30/year with consultation or meetup
                </p>
              </div>
              <nav className="flex gap-2">
                <a className="btn-ghost" href="/">
                  Library
                </a>
                <SessionNav />
              </nav>
            </div>
          </header>
          <main className="container-app space-y-6 py-6 pb-20 sm:pb-6">
            <EmailVerificationBanner />
            {children}
          </main>
        </div>
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white sm:hidden">
          <div className="container-app flex items-center justify-between gap-2 py-2">
            <a className="btn-ghost w-full justify-center" href="/">
              Library
            </a>
            <div className="w-full flex justify-center">
              <SessionNav />
            </div>
          </div>
        </nav>
        <ServiceWorker />
        </AuthProvider>
      </body>
    </html>
  );
}
