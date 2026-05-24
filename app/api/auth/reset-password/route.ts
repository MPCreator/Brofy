import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    const { token, password } = await req.json()

    if (!token || !password || password.length < 6) {
        return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
    }

    // Buscar usuario con ese token que no haya expirado
    const user = await prisma.profile.findFirst({
        where: {
            passwordResetToken: token,
            passwordResetExpires: { gt: new Date() },
        } as any,
    })

    if (!user) {
        return NextResponse.json({
            error: 'El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.'
        }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.profile.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        } as any,
    })

    return NextResponse.json({ success: true })
}
