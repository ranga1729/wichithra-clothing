import { createClient } from '@supabase/supabase-js'

/**
 * Admin client using the service_role key.
 * Bypasses RLS — use ONLY in trusted server code, never in the browser.
 * Suitable for: seeding, admin dashboards, bulk deletes, migrations.
 */
export function createSuperbaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}