import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="w-full border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">KnowYourself.ai</Link>
        <nav className="flex items-center gap-3">
          <Link href="/onboarding" className="px-3 py-2 rounded-xl hover:bg-gray-100">Onboarding</Link>
          <Link href="/quiz" className="px-3 py-2 rounded-xl hover:bg-gray-100">Quiz</Link>
          {user ? (
            <Link href="/account" className="px-3 py-2 rounded-xl bg-black text-white">Profile</Link>
          ) : (
            <Link href="/signin" className="px-3 py-2 rounded-xl bg-black text-white">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
