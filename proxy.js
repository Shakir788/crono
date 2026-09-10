import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['fr', 'ar', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always'
});

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. API aur Auth ko sabse PEHLE bypass karo
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // 2. Ab next-intl ko apni language routing karne do
  const response = intlMiddleware(request);

  // 3. Language prefix hata kar clean route nikalo
  const cleanPath = pathname.replace(/^\/(fr|ar|en)/, '') || '/';
  const localeMatch = pathname.match(/^\/(fr|ar|en)/);
  const locale = localeMatch ? localeMatch[1] : 'fr';

  // 4. Supabase Auth Cookie Check karo
  const hasSession = request.cookies.getAll().some(cookie => cookie.name.includes('-auth-token'));

  // 5. Route Rules
  const isProtectedRoute = cleanPath.startsWith('/dashboard') || cleanPath.startsWith('/analytics') || cleanPath.startsWith('/onboarding');
  const isAuthRoute = cleanPath === '/login' || cleanPath === '/signup';

  // 6. Security Redirects
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};