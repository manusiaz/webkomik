import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from '@/lib/supabase/env'

// Refreshes the Supabase session and turns anonymous visitors away from /admin.
// Role is checked again server-side in app/admin/page.tsx against the DB.
export async function proxy(request: NextRequest) {
  const toLogin = (err?: string) => {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    if (err) url.searchParams.set('err', err)
    return NextResponse.redirect(url)
  }
  if (!supabaseConfigured) return toLogin('config')

  let response = NextResponse.next({ request })
  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v))
      },
    },
  })
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return toLogin()
  return response
}

export const config = { matcher: ['/admin/:path*'] }
