import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    console.log("Starting payment test...");
    // Let's find a client profile to act as session
    const client = await prisma.profile.findFirst({ where: { role: 'client' } });
    if (!client) {
        console.error("No client found");
        return;
    }
    console.log("Using client:", client.email);

    // Let's find a real pet and establishment
    const pet = await prisma.pet.findFirst({ where: { ownerId: client.id } });
    const establishment = await prisma.establishment.findFirst();

    if (!pet || !establishment) {
        console.error("No pet or establishment found");
        return;
    }

    // Let's create a test appointment with multiple services
    const appointment = await prisma.appointment.create({
        data: {
            clientId: client.id,
            petId: pet.id,
            establishmentId: establishment.id,
            serviceType: 'Desparasitación Interna + Consulta General + Vacunación Completa',
            commissionType: 'booking',
            commissionAmount: 15.00,
            bookedServices: '[]',
            totalServicePrice: 180.00,
            status: 'pending'
        }
    });
    console.log("Created test appointment ID:", appointment.id);

    // Now test processPayment logic manually
    const merchantId = process.env.IZIPAY_MERCHANT_ID;
    const apiPassword = process.env.IZIPAY_API_PASSWORD;
    console.log("Izipay credentials from env:", { merchantId, apiPassword });

    let redirectUrl = `/checkout/simulate-payment?appointmentId=${appointment.id}`;

    if (merchantId && apiPassword && merchantId !== 'tu_codigo_de_comercio' && apiPassword !== 'tu_clave_de_api_password') {
        try {
            const authHeader = 'Basic ' + Buffer.from(`${merchantId}:${apiPassword}`).toString('base64');
            const apiUrl = process.env.NEXT_PUBLIC_IZIPAY_API_URL || 'https://api.izipay.pe';
            const amountInCents = Math.round(appointment.commissionAmount * 100);
            const appUrl = 'http://localhost:3000';

            console.log("Calling Izipay API with amountInCents:", amountInCents);
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
                        email: client.email || ''
                    },
                    redirectionParameters: {
                        successUrl: `${appUrl}/dashboard/client/pending?status=success`,
                        cancelUrl: `${appUrl}/dashboard/client/pending?status=cancel`
                    }
                })
            });

            const data = await response.json();
            console.log("Izipay response status:", response.status);
            console.log("Izipay response body:", data);
        } catch (error) {
            console.error('Connection error with Izipay API:', error);
        }
    } else {
        console.log("Using simulator mode redirect URL:", redirectUrl);
    }

    // Clean up
    await prisma.appointment.delete({ where: { id: appointment.id } });
    console.log("Cleanup done.");
}

run().catch(console.error).finally(() => prisma.$disconnect());
