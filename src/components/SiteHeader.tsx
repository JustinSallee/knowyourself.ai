// src/components/SiteHeader.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import SignInButton from "@/components/SignInButton";

// ensure this server component never gets statically cached
export const dynamic = "force-dynamic";

export default async function SiteHeader() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="w-full border-b/0 relative z-50">
      <div className="mx-auto max-w-6xl w-full px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          KnowYourself.ai
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap max-w-full">
          {/* show a tiny signed-in badge on narrow screens */}
          {user && (
            <span
              title={user.email ?? "Signed in"}
              className="hidden xs:inline rounded-full bg-white/10 px-2 py-1 text-xs truncate max-w-[40vw]"
            >
              {user.email ?? "Signed in"}
            </span>
          )}

          <Link href="/onboarding" className="px-3 py-2 rounded-xl hover:bg-white/10">
            Onboarding
          </Link>
          <Link href="/quiz" className="px-3 py-2 rounded-xl hover:bg-white/10">
            Quiz
          </Link>

          {user ? (
            <Link
              href="/account"
              className="px-3 py-2 rounded-xl bg-black text-white"
            >
              Profile
            </Link>
          ) : (
            <SignInButton next="/onboarding" />
          )}
        </nav>
      </div>
    </header>
  );
}
