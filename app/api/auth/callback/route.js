import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request) {
  const code = request.nextUrl.searchParams.get('code')
  const errorRedirect = NextResponse.redirect(new URL('/admin/login', request.url))

  if (!code) {
    return errorRedirect
  }

  const successRedirect = NextResponse.redirect(new URL('/admin/dashboard', request.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            successRedirect.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return errorRedirect
  }

  return successRedirect
}
