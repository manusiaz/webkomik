'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Logo } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

const ERR: Record<string, string> = {
  config: 'Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
  role: 'Akun ini tidak punya akses admin. Minta admin mengatur role kamu.',
}
const input = 'h-11 rounded-btn border border-line bg-bg px-3.5 text-sm text-ink outline-none focus:border-accent'

export function LoginForm({ next, err }: { next: string; err?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(err ? ERR[err] ?? '' : '')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (err === 'config') return
    setBusy(true)
    setMsg('')
    const { error } = await createClient().auth.signInWithPassword({ email, password: pw })
    setBusy(false)
    if (error) return setMsg(error.message === 'Invalid login credentials' ? 'Email atau kata sandi salah.' : error.message || 'Gagal terhubung ke server. Coba lagi.')
    router.replace(next)
    router.refresh()
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4 text-ink">
      <form onSubmit={submit} className="flex w-full max-w-[380px] flex-col gap-3.5 rounded-panel border border-line bg-surface p-6">
        <Logo />
        <div>
          <h1 className="m-0 text-[22px] font-extrabold tracking-[-0.03em]">Masuk panel admin</h1>
          <p className="m-0 mt-1 text-[13px] text-ink-3">Khusus admin, editor, dan uploader.</p>
        </div>
        <input type="email" required autoComplete="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={input} />
        <input type="password" required autoComplete="current-password" placeholder="Kata sandi" value={pw} onChange={e => setPw(e.target.value)} className={input} />
        {msg && <p role="alert" className="m-0 text-xs font-semibold text-danger">{msg}</p>}
        <button disabled={busy || err === 'config'} className="h-11 cursor-pointer rounded-btn border-0 bg-accent text-sm font-extrabold text-white disabled:cursor-default disabled:opacity-50">
          {busy ? 'Memeriksa…' : 'Masuk'}
        </button>
      </form>
    </main>
  )
}
