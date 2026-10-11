'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { byId, routes, SEED_PROGRESS } from '@/lib/comics'

/** Progress lives in localStorage, so the "continue" target is resolved on the client. */
export function Resume({ id }: { id: string }) {
  const router = useRouter()
  useEffect(() => {
    let p: Record<string, number> = {}
    try { p = JSON.parse(localStorage.getItem('nacp-progress') || '{}') } catch {}
    const read = p[id] ?? SEED_PROGRESS[id] ?? 0
    router.replace(routes.read(id, read ? Math.min(read + 1, byId[id].ch) : 1))
  }, [id, router])
  return <div className="min-h-screen bg-bg" />
}
