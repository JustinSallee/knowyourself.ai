"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignInPage() {
  const sb = supabaseBrowser();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  useEffect(() => {
    const { data: listener } = sb.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace(next);
    });
    return () => listener.subscription.unsubscribe();
  }, [sb, router, next]);

  const signInWithEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email") as string;
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/signin?next=${encodeURIComponent(next)}`
      },
    });
    if (error) alert(error.message);
    else alert("Check your email for the magic link");
  };

  const signInWithGoogle = async () => {
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`
      },
    });
    if (error) alert(error.message);
  };

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sign in</h1>

      <form onSubmit={signInWithEmail} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          className="w-full rounded border p-3"
          required
        />
        <button type="submit" className="w-full rounded bg-black p-3 text-white">
          Send magic link
        </button>
      </form>

      <button onClick={signInWithGoogle} className="w-full rounded border p-3">
        Continue with Google
      </button>
    </main>
  );
}
