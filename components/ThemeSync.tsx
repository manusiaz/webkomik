'use client'
import { useEffect } from 'react'
import { useLang, useTheme } from '@/lib/store'

/** Mirrors stored theme/lang onto <html>; the inline script in layout handles first paint. */
export function ThemeSync() {
  const [theme] = useTheme()
  const [lang] = useLang()
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  return null
}
