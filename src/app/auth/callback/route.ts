import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Auth Callback Route Handler
 * Handles the OAuth callback from Supabase (Google sign-in).
 * Exchanges the auth code for a session and redirects based on onboarding status.
 * 
 * CRITICAL: All cookies must be set on the SAME response object that gets returned.
 * Creating a new NextResponse.redirect() discards cookies set during code exchange.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Default redirect if something fails
  const fallbackUrl = new URL('/auth/login', origin)

  if (!code) {
    fallbackUrl.searchParams.set('error', 'missing_code')
    return NextResponse.redirect(fallbackUrl)
  }

  // We need to determine the redirect AFTER exchanging the code,
  // but cookies must be set on the response we return.
  // Strategy: Create a temporary redirect, exchange code, then create
  // the FINAL redirect and copy all cookies to it.
  const tempResponse = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            tempResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('[Auth Callback] Code exchange failed:', error)
    fallbackUrl.searchParams.set('error', 'auth_callback_failed')
    return NextResponse.redirect(fallbackUrl)
  }

  // Upsert profile from OAuth data (best effort)
  try {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
      email: data.user.email,
      role: 'owner',
      updated_at: new Date().toISOString(),
    })
  } catch (profileErr) {
    console.warn('[Auth Callback] Profile upsert warning:', profileErr)
  }

  // Check onboarding status
  let onboardingComplete = false
  try {
    const { data: onboarding } = await supabase
      .from('onboarding_preferences')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle()
    onboardingComplete = !!onboarding
  } catch (e) {
    console.warn('[Auth Callback] Onboarding check failed:', e)
  }

  // Create the FINAL redirect response
  const redirectPath = onboardingComplete ? '/dashboard' : '/onboarding'
  const finalResponse = NextResponse.redirect(new URL(redirectPath, origin))

  // CRITICAL: Copy all cookies from the temp response to the final redirect
  // This ensures the session cookies from exchangeCodeForSession() are preserved.
  tempResponse.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value, {
      path: '/',
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite as 'lax' | 'strict' | 'none' | undefined,
      maxAge: cookie.maxAge,
    })
  })

  return finalResponse
}
