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

        // En producción se exige de manera obligatoria la firma válida
        if (process.env.NODE_ENV === 'production') {
            if (!hashKey || hashKey === 'tu_llave_HMAC_SHA256_para_webhooks') {
                console.error('CRITICAL: IZIPAY_SHA256_KEY is not configured in production!')
                return NextResponse.json({ error: 'Configuración de seguridad incompleta en el servidor' }, { status: 500 })
            }
            const isValid = verifyHash(krAnswer, krHash, hashKey)
            if (!isValid) {
                console.error('Invalid signature for Izipay Webhook')
                return NextResponse.json({ error: 'Firma de webhook inválida' }, { status: 401 })
            }
        } else {
            // Permitir bypass solo en desarrollo si no está configurado
            if (!hashKey || hashKey === 'tu_llave_HMAC_SHA256_para_webhooks') {
                console.warn('--- WARNING: Webhook received but IZIPAY_SHA256_KEY is not configured. Processing without verification in development. ---')
            } else {
                const isValid = verifyHash(krAnswer, krHash, hashKey)
                if (!isValid) {
                    console.error('Invalid signature for Izipay Webhook')
                    return NextResponse.json({ error: 'Firma de webhook inválida' }, { status: 401 })
                }
            }
        }

        const paymentData = JSON.parse(krAnswer)
        const orderStatus = paymentData.orderStatus // 'PAID'
        const orderId = paymentData.orderDetails?.orderId || ''
        const transactionId = paymentData.transactions?.[0]?.uuid || `tx_${Date.now()}`

        if (orderStatus === 'PAID') {
            if (orderId && orderId.startsWith('DEBT_')) {
                // Liquidar comisiones acumuladas del proveedor
                const parts = orderId.split('_')
                const vetId = parts[1]
                
                // Buscar citas con deuda de este proveedor
                const appointmentsWithDebt = await prisma.appointment.findMany({
                    where: {
                        providerId: vetId,
                        paymentId: 'DEBT'
                    }
                })

                if (appointmentsWithDebt.length > 0) {
                    const totalDebt = appointmentsWithDebt.reduce((sum, apt) => sum + apt.commissionAmount, 0)
                    
                    // Liquidar citas
                    await prisma.appointment.updateMany({
                        where: {
                            providerId: vetId,
                            paymentId: 'DEBT'
                        },
                        data: {
                            paymentId: `PAID-${transactionId}`
                        }
                    })

                    // Despenalizar al proveedor inmediatamente al pagar
                    await prisma.profile.update({
                        where: { id: vetId },
                        data: { isPenalized: false }
                    })

                    // Crear la transacción de egreso
                    await prisma.transaction.create({
                        data: {
                            profileId: vetId,
                            type: 'expense',
                            amount: totalDebt,
                            category: 'commission',
                            description: 'Liquidación automática de comisiones Brofy via Izipay',
                            date: new Date().toISOString().split('T')[0]
                        }
                    })
                    console.log(`[Izipay Webhook] Liquidación exitosa para vetId: ${vetId}. Total: S/ ${totalDebt}. Transacción creada.`)
                }
            } else {
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
        }

        return new Response('OK', { status: 200 })

    } catch (error: any) {
        console.error('Error in Izipay Webhook:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
