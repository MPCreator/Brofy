import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicPaths = ['/', '/login', '/signup', '/terminos', '/privacidad', '/libro-de-reclamaciones', '/olvidaste-contrasena']

function isPublicPath(pathname: string): boolean {
    if (publicPaths.some(p => pathname === p)) return true
    if (pathname.startsWith('/restablecer-contrasena')) return true
    if (pathname.startsWith('/discover')) return true
    if (pathname.startsWith('/establishment')) return true
    return false
}

import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const sessionCookie = request.cookies.get('session')?.value

    // Allow static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // static files (.ico, .png, etc)
    ) {
        return NextResponse.next()
    }

    let isValidSession = false;

    if (sessionCookie) {
        try {
            const key = new TextEncoder().encode(process.env.JWT_SECRET || 'brofy_secret_key_change_in_production_2025');
            await jwtVerify(sessionCookie, key);
            isValidSession = true;
        } catch (error) {
            // Invalid JWT (expired, wrong signature, etc.)
            isValidSession = false;
        }
    }

    // Allow public paths
    if (isPublicPath(pathname)) {
        // Clear cookie flag from Server Components
        if (request.nextUrl.searchParams.get('clear') === 'true') {
            const response = NextResponse.next();
            response.cookies.set('session', '', { maxAge: 0, path: '/' });
            return response;
        }

        // If logged in and trying to access login/signup, redirect to dashboard
        if (isValidSession && (pathname === '/login' || pathname === '/signup')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // If cookie exists but is invalid, clear it on public pages too so they can log in
        if (sessionCookie && !isValidSession) {
            const response = NextResponse.next();
            response.cookies.set('session', '', { maxAge: 0, path: '/' });
            return response;
        }

        return NextResponse.next()
    }

    // Protected route — check for valid session
    if (!isValidSession) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        const response = NextResponse.redirect(loginUrl)
        
        // Clear the invalid cookie
        if (sessionCookie) {
            response.cookies.set('session', '', { maxAge: 0, path: '/' })
        }
        
        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}