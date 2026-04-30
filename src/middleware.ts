import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Protect /admin routes (except login)
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
    // In a full production app with Supabase, you would use @supabase/ssr to check cookies here.
    // For this prototype with basic @supabase/supabase-js, we check for a custom auth cookie.
    const hasAdminSession = req.cookies.has('sb-admin-session');
    
    if (!hasAdminSession) {
      const redirectUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
