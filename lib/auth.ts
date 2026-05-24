'use server'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import prisma from './prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import type { UserRole } from './types'

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'brofy_secret_key_change_in_production_2025')

// ---------------------------------------------------------------------------
// Validation Schemas
// ---------------------------------------------------------------------------

const SignupSchema = z.object({
    fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.enum(['vet', 'client', 'provider']),
    cmvpId: z.string().optional(),
    phone: z.string().optional(),
})

const LoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Contraseña inválida'),
})

// ---------------------------------------------------------------------------
// JWT Session Helpers
// ---------------------------------------------------------------------------

interface SessionPayload {
    sub: string;
    email: string;
    role: UserRole;
    fullName: string;
}

async function createSession(user: { id: string; email: string; role: string; fullName: string }) {
    const session = await new SignJWT({
        sub: user.id,
        email: user.email,
        role: user.role as UserRole,
        fullName: user.fullName,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)

    cookies().set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
    })

    return session
}

// ---------------------------------------------------------------------------
// Auth Actions
// ---------------------------------------------------------------------------

export async function signup(prevState: any, formData: FormData) {
    const validatedFields = SignupSchema.safeParse({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        cmvpId: formData.get('cmvpId'),
        phone: formData.get('phone'),
    })

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors }
    }

    const { fullName, email, password, role, cmvpId, phone } = validatedFields.data

    // Check if user exists
    const existingUser = await prisma.profile.findUnique({ where: { email } })
    if (existingUser) {
        if (existingUser.password === 'guest-no-login') {
            // Merge Ghost Profile into Real Profile
            const hashedPassword = await bcrypt.hash(password, 10)
            const profile = await prisma.profile.update({
                where: { id: existingUser.id },
                data: {
                    fullName,
                    password: hashedPassword,
                    role,
                    cmvpId: cmvpId || null,
                    phone: phone || null,
                }
            })
            await createSession(profile)
            return { success: true }
        }
        return { message: 'El usuario ya existe con este email.' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create profile
    const profile = await prisma.profile.create({
        data: {
            fullName,
            email,
            password: hashedPassword,
            role,
            cmvpId: role === 'vet' ? cmvpId || null : null,
            phone: phone || null,
        }
    })

    // Create session
    await createSession({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        fullName: profile.fullName,
    })

    // Redirect based on role
    const roleStr = role as string
    const dashboardPath = roleStr === 'admin'
        ? '/dashboard/admin'
        : roleStr === 'client'
            ? '/dashboard/client'
            : '/dashboard/vet'
    redirect(dashboardPath)
}

export async function login(prevState: any, formData: FormData) {
    console.log("Login action triggered with email:", formData.get('email'))
    const validatedFields = LoginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        console.log("Validation failed", validatedFields.error.flatten().fieldErrors)
        return { errors: validatedFields.error.flatten().fieldErrors }
    }

    const { email, password } = validatedFields.data

    let dashboardPath = '/dashboard/vet';

    try {
        const user = await prisma.profile.findUnique({ where: { email } })
        console.log("User found in DB:", user ? user.email : 'No user')

        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log("Invalid credentials")
            return { message: 'Credenciales inválidas.' }
        }

        // Create session
        console.log("Creating session...")
        await createSession({
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
        })
        console.log("Session created. Redirecting...")

        // Determine redirect path based on role
        dashboardPath = user.role === 'admin' 
            ? '/dashboard/admin' 
            : user.role === 'client' 
                ? '/dashboard/client' 
                : '/dashboard/vet'
        
    } catch (error) {
        console.error("Error during login:", error)
        return { message: 'Error de conexión. Inténtalo de nuevo.' }
    }

    // Redirect MUST be outside try/catch in Next.js Server Actions
    redirect(dashboardPath)
}

export async function logout() {
    cookies().delete('session')
    redirect('/login')
}

export async function getSession() {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) return null

    try {
        const { payload } = await jwtVerify(sessionCookie, key)
        
        // Verify user still exists in DB to prevent stale cookie errors
        const user = await prisma.profile.findUnique({
            where: { id: payload.sub as string }
        })
        
        if (!user) {
            console.log("getSession: user not found in DB for sub:", payload.sub)
            return null
        }
        
        return payload as unknown as SessionPayload
    } catch (error) {
        console.error("getSession: error verifying JWT:", error)
        return null
    }
}

export async function requireSession(): Promise<SessionPayload> {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }
    return session
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionPayload> {
    const session = await requireSession()
    if (!allowedRoles.includes(session.role)) {
        redirect('/dashboard')
    }
    return session
}
