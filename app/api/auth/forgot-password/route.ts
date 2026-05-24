import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    const { email } = await req.json()

    const user = await prisma.profile.findUnique({ where: { email } })
    if (!user || user.password === 'guest-no-login') {
        // No revelar si el usuario existe o no (seguridad)
        return NextResponse.json({ error: 'Si el correo está registrado, recibirás el enlace de recuperación.' })
    }

    // Generar token aleatorio
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.profile.update({
        where: { id: user.id },
        data: {
            passwordResetToken: token,
            passwordResetExpires: expires,
        } as any,
    })

    // En producción enviarías un email. Por ahora retornamos el token directamente.
    return NextResponse.json({ token })
}
