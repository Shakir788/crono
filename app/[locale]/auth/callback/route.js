import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const pathParts = request.nextUrl.pathname.split('/');
  const locale = pathParts[1] || 'fr';

  // Error handle karo
  if (error) {
    console.log('OAuth error:', error, searchParams.get('error_description'));
    return NextResponse.redirect(`${origin}/${locale}/login`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/login`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  console.log('Exchange data:', data);
  console.log('Exchange error:', exchangeError);

  if (!exchangeError && data?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    if (profile?.onboarding_completed) {
      return NextResponse.redirect(`${origin}/${locale}/dashboard`);
    } else {
      return NextResponse.redirect(`${origin}/${locale}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login`);
}