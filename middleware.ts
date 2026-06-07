import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that don't require authentication
const publicPaths = ['/', '/login', '/signup', '/terminos', '/privacidad', '/libro-de-reclamaciones', '/olvidaste-contrasena']

function isPublicPath(pathname: string): boolean {
    if (publicPaths.some(p => pathname === p)) return true
    if (pathname.startsWith('/restablecer-contrasena')) return true
    if (pathname.startsWith('/discover')) return true
    if (pathname.startsWith('/establishment')) return true
    return false
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // static files (.ico, .png, etc)
    ) {
        return NextResponse.next()
    }

    // Detect locale preference
    let locale = 'es'
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    if (cookieLocale === 'es' || cookieLocale === 'en') {
        locale = cookieLocale
    } else {
        const acceptLanguage = request.headers.get('accept-language')
        if (acceptLanguage) {
            if (acceptLanguage.startsWith('en') || (acceptLanguage.includes('en') && !acceptLanguage.startsWith('es'))) {
                locale = 'en'
            }
        }
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-locale', locale)

    // Inicializar el response base
    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    // Crear cliente de Supabase para middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Obtener la sesión y actualizar cookies
    const { data: { user } } = await supabase.auth.getUser()
    const isValidSession = !!user

    // Rutas públicas
    if (isPublicPath(pathname)) {
        // Si tiene sesión y entra a login/signup, redirige al dashboard
        if (isValidSession && (pathname === '/login' || pathname === '/signup')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return response
    }

    // Rutas protegidas - si no hay sesión, redirige a login
    if (!isValidSession) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return response
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