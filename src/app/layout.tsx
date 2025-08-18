import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* gradient everywhere */}
      <body className="min-h-screen bg-gradient-to-b from-indigo-700 via-slate-900 to-rose-700 antialiased">
        <SiteHeader />
        {/* spacing below the fixed header */}
        <div className="pt-14">{children}</div>
      </body>
    </html>
  );
}
