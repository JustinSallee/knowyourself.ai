// lib/auth-helpers.ts
import { redirect } from 'next/navigation';
import { supabaseServer } from './supabase-server';

export async function requireSessionOrRedirect(path = '/signin') {
  const sb = supabaseServer();
  const { data } = await sb.auth.getSession();
  if (!data.session) redirect(path);
  return data.session;
}
