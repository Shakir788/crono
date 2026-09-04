import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['fr', 'ar', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always'
});

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Pehle next-intl ko language routing handle karne do
  const response = intlMiddleware(request);

  // 2. API aur Auth Callbacks ko bypass karo
  if (pathname.includes('/api/') || pathname.includes('/auth/callback')) {
    return response;
  }

  // 3. Language prefix (fr/ar/en) hata kar clean route nikalo
  const cleanPath = pathname.replace(/^\/(fr|ar|en)/, '') || '/';
  const locale = pathname.match(/^\/(fr|ar|en)/)?.[1] || 'fr';

  // 4. Supabase Auth Cookie Check karo
  // Supabase cookie mein default '-auth-token' hota hai
  const hasSession = request.cookies.getAll().some(cookie => cookie.name.includes('-auth-token'));

  // 5. Route Rules define karo
  const isProtectedRoute = cleanPath.startsWith('/dashboard') || cleanPath.startsWith('/analytics') || cleanPath.startsWith('/onboarding');
  const isAuthRoute = cleanPath === '/login' || cleanPath === '/signup';

  // 6. Security Redirects (The Guard)
  if (isProtectedRoute && !hasSession) {
    // Bina login kiye dashboard/onboarding jane walo ko login par bhejo
    return Response.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isAuthRoute && hasSession) {
    // Logged in user agar login/signup page khele, toh dashboard par bhejo
    return Response.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return response;
}

export const config = {
  // Static files aur _next folders ko ignore karo taaki app fast rahe
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};