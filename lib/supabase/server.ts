import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_KEY, SUPABASE_URL } from './env'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components can't write cookies; proxy.ts refreshes the session.
        }
      },
    },
  })
}

export type StaffRole = 'admin' | 'editor' | 'uploader'
export const STAFF: StaffRole[] = ['admin', 'editor', 'uploader']

/** Verified user + role from the DB (never trust the cookie alone). */
export async function getStaff() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const uid = data?.claims?.sub
  if (!uid) return null
  const { data: profile } = await supabase.from('profiles').select('role, display_name').eq('id', uid).single()
  if (!profile || !STAFF.includes(profile.role)) return { uid, email: data.claims.email as string, role: null }
  return { uid, email: data.claims.email as string, role: profile.role as StaffRole, name: (profile.display_name as string | null) ?? (data.claims.email as string) }
}
