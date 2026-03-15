import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Client-side supabase (uses public anon key)
let _client: SupabaseClient | null = null
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) {
      _client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      )
    }
    return (_client as any)[prop]
  }
})

// Server-side supabase (uses service role key)
export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}
