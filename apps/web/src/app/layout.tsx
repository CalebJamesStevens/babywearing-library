import "./globals.css";
import "@neondatabase/auth/ui/css";
import type { ReactNode } from "react";
import AuthProvider from "@/components/AuthProvider";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import LinkButton from "@/components/LinkButton";
import ServiceWorker from "@/components/ServiceWorker";
import SessionNav from "@/components/SessionNav";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Babywearing Library",
  description: "Carrier library for wraps, structured carriers, and ring slings.",
  icons: {
    apple: "/icon.svg",
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#F9F8F1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="bg-background">
        <AuthProvider>
          <div className="flex min-h-dvh flex-col bg-background">
            <header className="border-b border-primary bg-background">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="font-heading text-xl leading-tight font-medium sm:text-base">
                    Babywearing Library
                  </p>
                  <p className="max-w-md text-base leading-snug text-muted-foreground sm:text-sm">
                    Member-supported, starting at $30/year with consultation or meetup
                  </p>
                </div>
                <nav className="hidden w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                  <LinkButton href="/" variant="ghost" size="lg" className="w-full justify-center sm:w-auto">
                    Library
                  </LinkButton>
                  <SessionNav />
                </nav>
              </div>
            </header>
            <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-6 sm:pb-6 sm:overflow-visible">
              <EmailVerificationBanner />
              {children}
            </main>
            <nav className="shrink-0 border-t border-primary bg-background sm:hidden">
              <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <LinkButton href="/" variant="ghost" size="lg" className="flex-1">
                  Library
                </LinkButton>
                <div className="flex flex-1 justify-center">
                  <SessionNav />
                </div>
              </div>
            </nav>
          </div>
          <ServiceWorker />
        </AuthProvider>
      </body>
    </html>
  );
}
