import type { Metadata } from 'next'
import { supabaseConfigured } from '@/lib/supabase/env'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Masuk · nacp', robots: { index: false } }

const safeNext = (n?: string) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/admin')

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; err?: string }> }) {
  const { next, err } = await searchParams
  return <LoginForm next={safeNext(next)} err={supabaseConfigured ? err : 'config'} />
}
