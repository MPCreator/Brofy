import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicPaths = ['/', '/login', '/signup', '/terminos', '/privacidad', '/libro-de-reclamaciones']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const sessionCookie = request.cookies.get('session')

    // Allow public paths
    if (publicPaths.some(p => pathname === p)) {
        // If logged in and trying to access login/signup, redirect to dashboard
        if (sessionCookie && (pathname === '/login' || pathname === '/signup')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    // Allow static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // static files (.ico, .png, etc)
    ) {
        return NextResponse.next()
    }

    // Protected route — check for session cookie
    if (!sessionCookie) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
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
