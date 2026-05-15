import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session - IMPORTANT: must call getUser() to refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/callback']
  const isPublicAuthRoute = publicRoutes.some(route => path.startsWith(route))

  // Protected routes
  const protectedRoutes = ['/onboarding', '/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // 1. Unauthenticated users trying to access protected routes → redirect to login
  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Authenticated users trying to access auth routes (login/signup) → redirect appropriately
  // Skip callback route to prevent redirect loops during OAuth flow
  if (user && isPublicAuthRoute && !path.startsWith('/auth/callback')) {
    let onboardingComplete = false
    try {
      const { data: onboarding } = await supabase
        .from('onboarding_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      onboardingComplete = !!onboarding
    } catch (e) {
      console.warn("[Middleware] Onboarding check failed:", e)
    }

    const redirectUrl = new URL(onboardingComplete ? '/dashboard' : '/onboarding', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // 3. Root redirect for authenticated users
  if (user && path === '/') {
    let onboardingComplete = false
    try {
      const { data: onboarding } = await supabase
        .from('onboarding_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      onboardingComplete = !!onboarding
    } catch (e) {
      console.warn("[Middleware] Onboarding check failed:", e)
    }

    const redirectUrl = new URL(onboardingComplete ? '/dashboard' : '/onboarding', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
