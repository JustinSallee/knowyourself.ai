// src/components/SiteHeader.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import SignInButton from "@/components/SignInButton";

// always render fresh so auth state is correct
export const dynamic = "force-dynamic";

export default async function SiteHeader() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="w-full">
      <div className="mx-auto max-w-6xl w-full px-3 py-2 flex items-center justify-center">
        <nav className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <Link href="/" className="text-sm sm:text-base font-semibold mr-1 sm:mr-3">
            KnowYourself.ai
          </Link>

          <Link
            href="/onboarding"
            className="px-2.5 py-1.5 text-sm rounded-xl hover:bg-white/10"
          >
            Onboarding
          </Link>

          {/* send users to the real quiz flow, not /quiz placeholder */}
          <Link
            href="/trial/1"
            className="px-2.5 py-1.5 text-sm rounded-xl hover:bg-white/10"
          >
            Quiz
          </Link>

          {user ? (
            <>
              <span
                title={user.email ?? "Signed in"}
                className="hidden sm:inline rounded-full bg-white/10 px-2 py-1 text-xs max-w-[40vw] truncate"
              >
                {user.email ?? "Signed in"}
              </span>
              <Link
                href="/account"
                className="px-2.5 py-1.5 text-sm rounded-xl bg-black text-white"
              >
                Profile
              </Link>
            </>
          ) : (
            <SignInButton size="sm" next="/onboarding" />
          )}
        </nav>
      </div>
    </header>
  );
}
