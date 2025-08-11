import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "KnowYourself.ai",
  description: "Private beta",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-100 antialiased">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-white/10 backdrop-blur">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-black text-white grid place-items-center font-bold">
                K
              </div>
              <div className="text-xl font-semibold tracking-tight">
                KnowYourself.ai
              </div>
            </div>
            <div className="text-sm opacity-70">private beta</div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
          {children}
        </main>

        <footer className="mx-auto max-w-5xl px-6 py-6 opacity-70 text-sm">
          Your chats are saved to improve replies next time
        </footer>
      </body>
    </html>
  );
}
