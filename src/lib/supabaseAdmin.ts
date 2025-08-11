// src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'

// Server-only Supabase client (SERVICE ROLE). Never import this in client components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE as string
)
