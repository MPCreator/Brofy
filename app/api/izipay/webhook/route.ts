import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

// Helper to verify the HMAC signature
function verifyHash(krAnswer: string, receivedHash: string, key: string): boolean {
    const calculatedHash = crypto
        .createHmac('sha256', key)
        .update(krAnswer)
        .digest('hex')
    return calculatedHash === receivedHash
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const krAnswer = formData.get('kr-answer') as string
        const krHash = formData.get('kr-hash') as string

        if (!krAnswer || !krHash) {
            return NextResponse.json({ error: 'Faltan parámetros de seguridad' }, { status: 400 })
        }

        const hashKey = process.env.IZIPAY_SHA256_KEY

        // Si no está configurada la firma SHA256 en desarrollo, permitir para pruebas locales
        if (!hashKey || hashKey === 'tu_llave_HMAC_SHA256_para_webhooks') {
            console.warn('--- WARNING: Webhook received but IZIPAY_SHA256_KEY is not configured. Processing without verification. ---')
        } else {
            const isValid = verifyHash(krAnswer, krHash, hashKey)
            if (!isValid) {
                console.error('Invalid signature for Izipay Webhook')
                return NextResponse.json({ error: 'Firma de webhook inválida' }, { status: 401 })
            }
        }

        const paymentData = JSON.parse(krAnswer)
        const orderStatus = paymentData.orderStatus // 'PAID'
        const orderId = paymentData.orderDetails.orderId // ID de la cita en Brofy
        const transactionId = paymentData.transactions?.[0]?.uuid || `tx_${Date.now()}`

        if (orderStatus === 'PAID') {
            // Generar el código de validación OTP y su expiración de 30 minutos
            const otp = Math.floor(100000 + Math.random() * 900000).toString()
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

            await prisma.appointment.update({
                where: { id: orderId },
                data: {
                    status: 'paid',
                    paymentId: transactionId,
                    otpValidationCode: otp,
                    otpExpiresAt: expiresAt
                }
            })
            
            console.log(`[Izipay Webhook] Cita ${orderId} actualizada a PAID con OTP: ${otp}`)
        }

        return new Response('OK', { status: 200 })

    } catch (error: any) {
        console.error('Error in Izipay Webhook:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
