import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { supabaseConfigured } from '@/lib/supabase/env'
import { getStaff } from '@/lib/supabase/server'
import { Admin } from './Admin'
import type { Role } from './data'

export const metadata: Metadata = { title: 'nacp admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

const ROLE: Record<string, Role> = { admin: 'Admin', editor: 'Editor', uploader: 'Uploader' }

export default async function AdminPage() {
  if (!supabaseConfigured) redirect('/login?err=config&next=/admin')
  const me = await getStaff()
  if (!me) redirect('/login?next=/admin')
  if (!me.role) redirect('/login?err=role&next=/admin')
  return <Admin me={{ role: ROLE[me.role], name: me.name }} />
}
