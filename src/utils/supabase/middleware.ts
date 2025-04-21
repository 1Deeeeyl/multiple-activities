import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // recover password fix
  const hasSupabaseAuthParams =
    request.nextUrl.searchParams.has('access_token') ||
    request.nextUrl.searchParams.has('refresh_token') ||
    request.nextUrl.searchParams.has('type') ||
    request.nextUrl.searchParams.has('error') ||
    request.nextUrl.searchParams.has('code'); 
  if (request.nextUrl.pathname === '/' || hasSupabaseAuthParams) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicRoutes = ['/signup', '/auth', '/request-password'];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect authenticated users away from public routes
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/'; // redirect to index route
    return NextResponse.redirect(url);
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/request-password') &&
    request.nextUrl.pathname !== '/' 
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/';// redirect to index route
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// supabase docs