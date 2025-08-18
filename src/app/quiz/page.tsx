// src/app/quiz/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/signin?next=/quiz");
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Smartness Score</h1>
      <p className="text-base">
        Quiz content goes here. Wire up your questions and state.
      </p>
    </main>
  );
}
