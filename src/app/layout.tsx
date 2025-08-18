// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "KnowYourself.ai",
  description: "Smartness Score and more",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
     <body className="min-h-screen text-white bg-gradient-to-b from-indigo-700 via-slate-900 to-rose-700">
  <div className="fixed inset-x-0 top-0 z-50">
    <SiteHeader />
  </div>
  <main className="mx-auto max-w-6xl px-4 pt-20 pb-10">{children}</main>
</body>

    </html>
  );
}
