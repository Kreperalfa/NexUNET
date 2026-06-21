import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set(name, value, options)
        },
        remove(name, options) {
          res.cookies.delete(name, options)
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname

  // ⚠️ IMPORTANTE: NO proteger verify-otp
  if (pathname.startsWith('/verify-otp')) {
    return res
  }

  // ✔ Proteger dashboard
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/verify-otp']
}
