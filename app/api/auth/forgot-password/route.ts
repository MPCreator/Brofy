import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    const { email } = await req.json()

    if (!email) {
        return NextResponse.json({ error: 'El correo electrónico es requerido.' }, { status: 400 })
    }

    const lowercasedEmail = email.toLowerCase()

    // Verificar si el usuario existe
    const user = await prisma.profile.findUnique({ where: { email: lowercasedEmail } })
    
    if (!user || user.password === 'guest-no-login') {
        // Seguridad: No revelamos si el correo existe o no en la plataforma
        return NextResponse.json({ 
            success: true, 
            message: 'Si el correo está registrado, recibirás un enlace de recuperación en los próximos minutos.' 
        })
    }

    const supabase = createClient()
    
    // Callback PKCE que intercambiará el código de sesión y redirigirá a /restablecer-contrasena
    const requestUrl = new URL(req.url)
    const origin = requestUrl.origin
    const redirectTo = `${origin}/api/auth/callback?next=/restablecer-contrasena`

    const { error } = await supabase.auth.resetPasswordForEmail(lowercasedEmail, {
        redirectTo,
    })

    if (error) {
        console.error("Supabase resetPasswordForEmail error:", error.message)
        return NextResponse.json({ error: 'Hubo un problema al solicitar el restablecimiento. Inténtalo de nuevo.' }, { status: 500 })
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Enlace de recuperación enviado exitosamente a tu correo.' 
    })
}
