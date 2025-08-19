// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "KnowYourself.ai",
  description: "Smartness Score and more",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-white bg-gradient-to-b from-indigo-900 via-slate-950 to-rose-900">
        <div className="h-dvh flex flex-col">
          <TopBar />
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <SiteHeader />
              <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
