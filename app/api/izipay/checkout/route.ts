import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { appointmentId } = await request.json()

        if (!appointmentId) {
            return NextResponse.json({ error: 'Falta el appointmentId' }, { status: 400 })
        }

        // 1. Obtener la cita y el cliente
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { client: true }
        })

        if (!appointment) {
            return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
        }

        if (appointment.clientId !== session.sub) {
            return NextResponse.json({ error: 'No autorizado: Propietario no coincide' }, { status: 403 })
        }

        // Verificar si las credenciales de Izipay están configuradas
        const merchantId = process.env.IZIPAY_MERCHANT_ID
        const apiPassword = process.env.IZIPAY_API_PASSWORD

        // 2. Si faltan credenciales, simular la redirección a nuestro simulador local
        if (!merchantId || !apiPassword || merchantId === 'tu_codigo_de_comercio' || apiPassword === 'tu_clave_de_api_password') {
            console.log('--- IZIPAY SIMULATOR MODE ACTIVATED ---')
            return NextResponse.json({ 
                redirectUrl: `/checkout/simulate-payment?appointmentId=${appointmentId}` 
            })
        }

        // Monto en centavos (ej: S/ 5.00 -> 500)
        const amountInCents = Math.round(appointment.commissionAmount * 100)

        // 3. Autenticación Basic para Izipay (Merchant ID : API Password)
        const authHeader = 'Basic ' + Buffer.from(`${merchantId}:${apiPassword}`).toString('base64')
        const apiUrl = process.env.NEXT_PUBLIC_IZIPAY_API_URL || 'https://api.izipay.pe'

        // 4. Registrar cobro en Izipay (Hosted Payment Page)
        const response = await fetch(`${apiUrl}/api-payment/v4/Charge/CreatePayment`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amountInCents,
                currency: appointment.currency || 'PEN',
                orderId: appointment.id,
                paymentMethodType: "IPG_HOSTED",
                customer: {
                    email: appointment.client.email
                },
                redirectionParameters: {
                    successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/client/pending?status=success`,
                    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/client/pending?status=cancel`
                }
            })
        })

        const data = await response.json()

        if (data.status !== 'SUCCESS' || !data.answer || !data.answer.redirectUrl) {
            console.error('Izipay API Error Response:', data)
            return NextResponse.json({ error: 'Error de comunicación con la pasarela de pagos', details: data }, { status: 400 })
        }

        return NextResponse.json({ 
            redirectUrl: data.answer.redirectUrl 
        })

    } catch (error: any) {
        console.error('Error Izipay Checkout Route:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
