import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import { JwtPayload, UserRole } from "./types/auth";

const TOKEN_NAME = process.env.TOKEN_NAME!;

const PROTECTED_ROUTES : Record<string, ReadonlyArray<UserRole>> = {
  '/admin': ['admin', 'superAdmin'],
} as const;

function getRequiredRoles(pathname: string): ReadonlyArray<UserRole> {
  return PROTECTED_ROUTES[pathname] || [];
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_NAME)?.value;

  const requiredRoles = getRequiredRoles(pathname);
  const isProtectedRoute = requiredRoles.length > 0;

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if(!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl)
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if(decoded.exp && decoded.exp * 1000 < Date.now()) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);

      //make the error page/login page read search params send by here. show a toast then.
      loginUrl.searchParams.set('error', 'session-expired');

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(TOKEN_NAME);
      return response;
    }

    // Check if user has required role for admin routes
    if (!requiredRoles.includes(decoded.role as UserRole)) {
      const accessDeniedUrl = new URL('/error', request.url);
      return NextResponse.redirect(accessDeniedUrl);
    }

    return NextResponse.next();
  } catch(error) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'invalid-token');
    
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(TOKEN_NAME);
    return response;
  }
  
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};