'use client'
// Browser-persisted state shared by every page (same keys as the prototype).
// Real version syncs to the account on the server; this is the local cache.
import { useCallback, useSyncExternalStore } from 'react'
import { DEFAULT_BM, SEED_HIST, type HistEntry, type Lang } from './comics'

const listeners = new Set<() => void>()
const cache = new Map<string, unknown>()

function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T
  let v = fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw != null) v = JSON.parse(raw)
  } catch {}
  cache.set(key, v)
  return v
}

export function setStored<T>(key: string, value: T) {
  cache.set(key, value)
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  listeners.forEach(l => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  const onStorage = (e: StorageEvent) => { if (e.key) { cache.delete(e.key); l() } }
  addEventListener('storage', onStorage)
  return () => { listeners.delete(l); removeEventListener('storage', onStorage) }
}

export function useStored<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(subscribe, () => read(key, fallback), () => fallback)
  const set = useCallback((v: T | ((prev: T) => T)) => {
    setStored(key, typeof v === 'function' ? (v as (p: T) => T)(read(key, fallback)) : v)
  }, [key, fallback])
  return [value, set] as const
}

export type Theme = 'dark' | 'light'
const EMPTY: Record<string, number> = {}

export const useTheme = () => useStored<Theme>('nacp-theme', 'dark')
export const useLang = () => useStored<Lang>('nacp-lang', 'id')
export const usePremium = () => useStored('nacp-premium', false)
export const useLogged = () => useStored('nacp-logged', true)
export const useBookmarks = () => useStored<string[]>('nacp-bm', DEFAULT_BM)
export const useProgress = () => useStored<Record<string, number>>('nacp-progress', EMPTY)
export const useHistory = () => useStored<HistEntry[]>('nacp-hist', SEED_HIST)

/** Ads render only for non-premium readers. Premium users never load ad scripts. */
export const useAdsOn = () => !usePremium()[0]
