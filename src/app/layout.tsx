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
  <body className="min-h-screen text-white bg-gradient-to-b from-indigo-900 via-slate-950 to-rose-900">
  <SiteHeader />
  <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
</body>



    </html>
  );
}
