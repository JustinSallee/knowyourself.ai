import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
export const runtime = 'edge'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)

export async function GET() {
  // for each user build a 200 to 300 char summary from last 100 msgs and upsert into memories kind 'summary'
  // keep it short to keep tokens cheap
  return new Response('ok')
}
