import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return new Response(error.message, { status: 500 });
  return Response.json(data);
}
