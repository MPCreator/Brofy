'use server'

import prisma from './prisma'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import type { UserRole } from './types'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// ---------------------------------------------------------------------------
// Validation Schemas
// ---------------------------------------------------------------------------

const SignupSchema = z.object({
    fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.enum(['vet', 'client', 'provider']),
    cmvpId: z.string().nullable().optional(),
    phone: z.string().min(9, 'El teléfono es obligatorio y debe tener al menos 9 dígitos'),
})

const LoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Contraseña inválida'),
})

// ---------------------------------------------------------------------------
// Session Types
// ---------------------------------------------------------------------------

interface SessionPayload {
    sub: string;
    email: string;
    role: UserRole;
    fullName: string;
}

// ---------------------------------------------------------------------------
// Auth Actions
// ---------------------------------------------------------------------------

export async function signup(prevState: any, formData: FormData) {
    console.log("Signup action triggered with email:", formData.get('email'))
    const validatedFields = SignupSchema.safeParse({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        cmvpId: formData.get('cmvpId'),
        phone: formData.get('phone'),
    })

    if (!validatedFields.success) {
        console.log("Zod validation FAILED on fields:", validatedFields.error.flatten().fieldErrors)
        return { errors: validatedFields.error.flatten().fieldErrors }
    }

    console.log("Zod validation PASSED for email:", validatedFields.data.email)

    const { fullName, password, role, cmvpId, phone } = validatedFields.data
    const email = validatedFields.data.email.toLowerCase()

    // Validar casillas de verificación legal
    const ageConfirm = formData.get('ageConfirm')
    const termsConfirm = formData.get('termsConfirm')
    const vetProfConfirm = formData.get('vetProfConfirm')
    const providerConfirm = formData.get('providerConfirm')

    if (!ageConfirm) {
        return { message: 'Debes confirmar que eres mayor de edad (18 años o más) para registrarte.' }
    }
    if (!termsConfirm) {
        return { message: 'Debes aceptar los Términos y Condiciones y la Política de Privacidad de Brofy.' }
    }
    if (role === 'vet' && !vetProfConfirm) {
        return { message: 'Debes confirmar tu habilitación profesional (CMVP) vigente para continuar.' }
    }
    if (role === 'provider' && !providerConfirm) {
        return { message: 'Debes declarar la licitud y autorizaciones de tus servicios para continuar.' }
    }

    if (role === 'vet' && (!cmvpId || cmvpId.trim() === '')) {
        return { message: 'El número de colegiatura (CMVP) es obligatorio para registrarse como veterinario.' }
    }

    let dashboardPath = '/dashboard/client'

    try {
        console.log("1. Checking if user exists in Prisma...")
        const existingUser = await prisma.profile.findUnique({ where: { email } })
        console.log("2. Prisma existing user check done. User exists:", !!existingUser)
        
        let ghostIdToMerge: string | null = null
        if (existingUser) {
            if (existingUser.password === 'guest-no-login') {
                ghostIdToMerge = existingUser.id
                // Renombrar el email del perfil fantasma temporalmente para evitar choques únicos en la inserción
                await prisma.profile.update({
                    where: { id: ghostIdToMerge },
                    data: { email: `${email}-ghost-${Date.now()}` }
                })
            } else {
                return { message: 'El usuario ya existe con este email.' }
            }
        }

        console.log("3. Resolving host headers...")
        const host = headers().get('host')
        const protocol = host?.startsWith('localhost') ? 'http' : 'https'
        const origin = `${protocol}://${host}`
        const redirectTo = `${origin}/api/auth/callback`
        console.log("4. Headers resolved, redirect URL is:", redirectTo)

        console.log("5. Initializing Supabase server client...")
        const supabase = createClient()
        console.log("6. Supabase client initialized, triggering signUp...")
        
        // Registrar el usuario en Supabase Auth con redirectTo dinámico
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectTo,
                data: {
                    full_name: fullName,
                    role: role,
                }
            }
        })

        console.log("Supabase signUp request finished. User ID:", data.user?.id, "Error:", error?.message)

        if (error) {
            console.error("Supabase signUp error:", error.message)
            // Si renombramos un perfil fantasma, debemos regresarlo a su estado si falla el registro
            if (ghostIdToMerge) {
                await prisma.profile.update({
                    where: { id: ghostIdToMerge },
                    data: { email }
                })
            }
            return { message: error.message || 'Error al registrar el usuario en el servidor.' }
        }

        const newUserId = data.user?.id
        if (!newUserId) {
            return { message: 'No se pudo generar la sesión del usuario.' }
        }

        // Verificar si el perfil fue creado automáticamente por el trigger de Supabase
        const existingProfile = await prisma.profile.findUnique({
            where: { id: newUserId }
        })

        if (existingProfile) {
            // El trigger funcionó, actualizamos campos adicionales
            await prisma.profile.update({
                where: { id: newUserId },
                data: {
                    phone: phone || null,
                    cmvpId: role === 'vet' ? cmvpId || null : null,
                    password: 'supabase-auth-managed'
                }
            })
            console.log("PostgreSQL profile (created by trigger) successfully updated for user ID:", newUserId)
        } else {
            // Si el trigger de la base de datos no está instalado, creamos el perfil manualmente
            await prisma.profile.create({
                data: {
                    id: newUserId,
                    email,
                    fullName,
                    role,
                    phone: phone || null,
                    cmvpId: role === 'vet' ? cmvpId || null : null,
                    password: 'supabase-auth-managed'
                }
            })
            console.log("PostgreSQL profile (created manually) successfully inserted for user ID:", newUserId)
        }

        // Si venía de un perfil fantasma, migramos todos los registros
        if (ghostIdToMerge) {
            await mergeGhostProfile(ghostIdToMerge, newUserId)
        }

        console.log("Session checks - session exists:", !!data.session)

        // Si el registro fue exitoso pero no hay sesión activa (porque la confirmación de correo está activada en Supabase)
        if (!data.session) {
            return {
                success: true,
                message: '¡Registro casi completo! Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar tu cuenta antes de iniciar sesión.'
            }
        }

        const roleStr = role as string
        dashboardPath = roleStr === 'admin'
            ? '/dashboard/admin'
            : roleStr === 'client'
                ? '/dashboard/client'
                : '/dashboard/vet'

    } catch (e) {
        console.error("Error during signup server action:", e)
        return { message: 'Error de servidor. Inténtalo de nuevo.' }
    }

    redirect(dashboardPath)
}

async function mergeGhostProfile(ghostId: string, realId: string) {
    try {
        console.log(`Merging ghost profile ${ghostId} into real profile ${realId}`)
        
        // 1. Pets (dueño)
        await prisma.pet.updateMany({
            where: { ownerId: ghostId },
            data: { ownerId: realId }
        })

        // 2. Appointments (cliente y proveedor)
        await prisma.appointment.updateMany({
            where: { clientId: ghostId },
            data: { clientId: realId }
        })
        await prisma.appointment.updateMany({
            where: { providerId: ghostId },
            data: { providerId: realId }
        })

        // 3. Reminders
        await prisma.reminder.updateMany({
            where: { clientId: ghostId },
            data: { clientId: realId }
        })
        await prisma.reminder.updateMany({
            where: { createdBy: ghostId },
            data: { createdBy: realId }
        })

        // 4. Transactions
        await prisma.transaction.updateMany({
            where: { profileId: ghostId },
            data: { profileId: realId }
        })

        // 5. Reviews
        await prisma.review.updateMany({
            where: { clientId: ghostId },
            data: { clientId: realId }
        })

        // 6. Establishments
        await prisma.establishment.updateMany({
            where: { ownerId: ghostId },
            data: { ownerId: realId }
        })

        // 7. Borrar el perfil fantasma
        await prisma.profile.delete({
            where: { id: ghostId }
        })

        console.log("Merge completed successfully.")
    } catch (error) {
        console.error("Error merging ghost profile:", error)
    }
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

    const { password } = validatedFields.data
    const email = validatedFields.data.email.toLowerCase()

    let dashboardPath = '/dashboard/vet';

    try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            console.log("Supabase login error:", error.message)
            return { message: 'Credenciales inválidas.' }
        }

        // Obtener el perfil de la base de datos para saber su rol y redirigir
        let userProfile = await prisma.profile.findUnique({
            where: { id: data.user.id }
        })

        if (!userProfile) {
            // Sincronización automática de cuentas sembradas / creadas manualmente en Supabase Auth
            const profileByEmail = await prisma.profile.findUnique({
                where: { email }
            })

            if (profileByEmail) {
                console.log(`[Sync] Sincronizando perfil de ${email} de ID semilla ${profileByEmail.id} a nuevo ID de Supabase ${data.user.id}`)
                try {
                    // 1. Liberar la restricción de correo único modificando temporalmente el email del perfil antiguo
                    const tempEmail = `temp_${Date.now()}_${profileByEmail.email}`
                    await prisma.profile.update({
                        where: { id: profileByEmail.id },
                        data: { email: tempEmail }
                    })

                    // 2. Crear el nuevo perfil con el ID correcto de Supabase y el correo oficial
                    userProfile = await prisma.profile.create({
                        data: {
                            id: data.user.id,
                            email,
                            fullName: profileByEmail.fullName,
                            role: profileByEmail.role,
                            phone: profileByEmail.phone,
                            cmvpId: profileByEmail.cmvpId,
                            cmvpValidated: profileByEmail.cmvpValidated,
                            password: 'supabase-auth-managed'
                        }
                    })

                    // 3. Fusionar todos los datos (mascotas, clínicas, citas sembradas) al nuevo ID y borrar el perfil antiguo temporal
                    await mergeGhostProfile(profileByEmail.id, data.user.id)
                } catch (syncError) {
                    console.error("Error al sincronizar perfil en login:", syncError)
                    return { message: 'Error de sincronización con la base de datos. Contacta al administrador.' }
                }
            } else {
                return { message: 'No se encontró un perfil asociado a esta cuenta.' }
            }
        }

        // Verificar si la cuenta está suspendida o inactiva
        if (!userProfile.isActive) {
            await supabase.auth.signOut()
            return { message: 'Tu cuenta ha sido desactivada por el administrador.' }
        }

        dashboardPath = userProfile.role === 'admin' 
            ? '/dashboard/admin' 
            : userProfile.role === 'client' 
                ? '/dashboard/client' 
                : '/dashboard/vet'
        
    } catch (e) {
        console.error("Error during login action:", e)
        return { message: 'Error de conexión. Inténtalo de nuevo.' }
    }

    redirect(dashboardPath)
}

export async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function getSession() {
    try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return null
        }

        // Obtener los datos del perfil
        const dbProfile = await prisma.profile.findUnique({
            where: { id: user.id }
        })

        if (!dbProfile) {
            console.log("getSession: Perfil no encontrado para ID:", user.id)
            // Autolimpiar sesión huérfana de Supabase para prevenir bucles infinitos de redirección
            try {
                await supabase.auth.signOut()
            } catch (e) {
                console.error("No se pudo autocerrar sesión huérfana:", e)
            }
            return null
        }

        return {
            sub: user.id,
            email: user.email!,
            role: dbProfile.role as UserRole,
            fullName: dbProfile.fullName,
        }
    } catch (e: any) {
        // En Next.js, Dynamic Server Usage es una excepción especial para marcar la ruta como dinámica.
        // Si la atrapamos y silenciamos, Next.js imprimirá advertencias ruidosas en los logs de compilación. Debemos relanzarla.
        if (e && (e.message?.includes('Dynamic server usage') || e.digest === 'DYNAMIC_SERVER_USAGE')) {
            throw e
        }
        console.error("getSession error:", e)
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
