import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Clean existing data
    await prisma.medicalRecord.deleteMany()
    await prisma.appointment.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.service.deleteMany()
    await prisma.pet.deleteMany()
    await prisma.establishment.deleteMany()
    await prisma.profile.deleteMany()

    // --- Create Profiles ---
    const hashedPassword = await bcrypt.hash('123456', 10)

    const clientUser = await prisma.profile.create({
        data: {
            email: 'cliente@brofy.pe',
            password: hashedPassword,
            fullName: 'María López García',
            role: 'client',
            phone: '+51999111222',
            latitude: -12.0900,
            longitude: -77.0500,
        }
    })

    const vetUser = await prisma.profile.create({
        data: {
            email: 'vet@brofy.pe',
            password: hashedPassword,
            fullName: 'Dr. Carlos Mendoza',
            role: 'vet',
            cmvpId: 'CMVP-12345',
            phone: '+51999333444',
            latitude: -12.0850,
            longitude: -77.0450,
        }
    })

    const providerUser = await prisma.profile.create({
        data: {
            email: 'groomer@brofy.pe',
            password: hashedPassword,
            fullName: 'Ana Ríos Pet Spa',
            role: 'provider',
            phone: '+51999555666',
            latitude: -12.1000,
            longitude: -77.0300,
        }
    })

    console.log('✅ Profiles created')

    // --- Create Establishments ---
    const clinic = await prisma.establishment.create({
        data: {
            ownerId: vetUser.id,
            name: 'Clínica Veterinaria San Borja',
            address: 'Av. San Borja Norte 345, San Borja',
            district: 'San Borja',
            latitude: -12.0870,
            longitude: -77.0050,
            type: 'clinic',
            phone: '+5114567890',
            description: 'Clínica veterinaria con 15 años de experiencia. Atención 24/7 para emergencias.',
            rating: 4.8,
            operatingHours: JSON.stringify({
                mon: { open: '08:00', close: '20:00' },
                tue: { open: '08:00', close: '20:00' },
                wed: { open: '08:00', close: '20:00' },
                thu: { open: '08:00', close: '20:00' },
                fri: { open: '08:00', close: '20:00' },
                sat: { open: '09:00', close: '14:00' },
            }),
        }
    })

    const groomerShop = await prisma.establishment.create({
        data: {
            ownerId: providerUser.id,
            name: 'PetSpa Premium',
            address: 'Jr. Los Olivos 789, Miraflores',
            district: 'Miraflores',
            latitude: -12.1200,
            longitude: -77.0300,
            type: 'groomer',
            phone: '+5119876543',
            description: 'Grooming de lujo para tu mascota. Baños terapéuticos y cortes de raza.',
            rating: 4.5,
            operatingHours: JSON.stringify({
                mon: { open: '09:00', close: '18:00' },
                tue: { open: '09:00', close: '18:00' },
                wed: { open: '09:00', close: '18:00' },
                thu: { open: '09:00', close: '18:00' },
                fri: { open: '09:00', close: '18:00' },
                sat: { open: '10:00', close: '15:00' },
            }),
        }
    })

    const hospital = await prisma.establishment.create({
        data: {
            ownerId: vetUser.id,
            name: 'Hospital Veterinario de Lima',
            address: 'Av. Javier Prado Este 1234, La Molina',
            district: 'La Molina',
            latitude: -12.0780,
            longitude: -76.9500,
            type: 'hospital',
            phone: '+5113456789',
            description: 'Hospital especializado con quirófano, UCI y laboratorio clínico.',
            rating: 4.9,
            operatingHours: JSON.stringify({
                mon: { open: '00:00', close: '23:59' },
                tue: { open: '00:00', close: '23:59' },
                wed: { open: '00:00', close: '23:59' },
                thu: { open: '00:00', close: '23:59' },
                fri: { open: '00:00', close: '23:59' },
                sat: { open: '00:00', close: '23:59' },
                sun: { open: '00:00', close: '23:59' },
            }),
        }
    })

    const walker = await prisma.establishment.create({
        data: {
            ownerId: providerUser.id,
            name: 'PaseosPro Lima',
            address: 'Parque Kennedy, Miraflores',
            district: 'Miraflores',
            latitude: -12.1190,
            longitude: -77.0290,
            type: 'walker',
            phone: '+51987654321',
            description: 'Paseos seguros y divertidos. Grupos pequeños, GPS en tiempo real.',
            rating: 4.3,
            operatingHours: JSON.stringify({
                mon: { open: '06:00', close: '19:00' },
                tue: { open: '06:00', close: '19:00' },
                wed: { open: '06:00', close: '19:00' },
                thu: { open: '06:00', close: '19:00' },
                fri: { open: '06:00', close: '19:00' },
                sat: { open: '07:00', close: '17:00' },
                sun: { open: '07:00', close: '12:00' },
            }),
        }
    })

    console.log('✅ Establishments created')

    // --- Create Pets ---
    const firulais = await prisma.pet.create({
        data: {
            ownerId: clientUser.id,
            name: 'Firulais',
            species: 'dog',
            breed: 'Golden Retriever',
            dateOfBirth: '2021-03-15',
            weight: 32.5,
            sex: 'male',
            medicalHistory: JSON.stringify([
                {
                    date: '2021-05-20',
                    type: 'vaccination',
                    description: 'Vacuna Parvovirus (1ra dosis)',
                    provider: 'Dr. Carlos Mendoza',
                    providerCmvp: 'CMVP-12345',
                    notes: 'Próxima dosis en 3 semanas',
                },
                {
                    date: '2021-06-10',
                    type: 'vaccination',
                    description: 'Vacuna Parvovirus (2da dosis)',
                    provider: 'Dr. Carlos Mendoza',
                    providerCmvp: 'CMVP-12345',
                },
                {
                    date: '2022-01-15',
                    type: 'vaccination',
                    description: 'Vacuna Antirrábica',
                    provider: 'Dr. Carlos Mendoza',
                    providerCmvp: 'CMVP-12345',
                    notes: 'Refuerzo anual',
                },
                {
                    date: '2023-03-22',
                    type: 'consultation',
                    description: 'Dermatitis alérgica',
                    provider: 'Dr. Carlos Mendoza',
                    providerCmvp: 'CMVP-12345',
                    notes: 'Prescripción: Prednisolona 5mg, 1 tab cada 12h por 7 días. Shampoo medicado.',
                },
                {
                    date: '2024-08-10',
                    type: 'deworming',
                    description: 'Desparasitación interna',
                    provider: 'Dr. Carlos Mendoza',
                    providerCmvp: 'CMVP-12345',
                    notes: 'Producto: Drontal Plus. Próxima desparasitación en 3 meses.',
                },
                {
                    date: '2025-01-05',
                    type: 'vaccination',
                    description: 'Vacuna Antirrábica (refuerzo anual)',
                    provider: 'Dr. Carlos Mendoza',
                    providerCmvp: 'CMVP-12345',
                },
            ]),
        }
    })

    const mishi = await prisma.pet.create({
        data: {
            ownerId: clientUser.id,
            name: 'Mishi',
            species: 'cat',
            breed: 'Persa',
            dateOfBirth: '2022-08-01',
            weight: 4.2,
            sex: 'female',
            medicalHistory: JSON.stringify([
                {
                    date: '2022-10-15',
                    type: 'vaccination',
                    description: 'Triple Felina (1ra dosis)',
                    provider: 'Dr. Carlos Mendoza',
                    providerCmvp: 'CMVP-12345',
                },
                {
                    date: '2023-05-20',
                    type: 'surgery',
                    description: 'Esterilización',
                    provider: 'Dr. Carlos Mendoza',
                    providerCmvp: 'CMVP-12345',
                    notes: 'Cirugía sin complicaciones. Retiro de puntos en 10 días.',
                },
            ]),
        }
    })

    console.log('✅ Pets created')

    // --- Create a completed appointment + medical record ---
    const completedAppointment = await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: firulais.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'completed',
            serviceType: 'consultation',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '123456',
            paymentId: 'mock_seed_001',
            scheduledAt: new Date('2025-12-20T10:00:00'),
            completedAt: new Date('2025-12-20T10:45:00'),
        }
    })

    await prisma.medicalRecord.create({
        data: {
            appointmentId: completedAppointment.id,
            vetId: vetUser.id,
            weight: 32.5,
            temperature: 38.6,
            heartRate: 90,
            symptoms: JSON.stringify(['Inapetencia', 'Letargia']),
            diagnosis: 'Gastroenteritis leve',
            prescription: 'Metronidazol 250mg, 1 tab cada 12h por 5 días. Dieta blanda.',
            treatment: 'Hidratación subcutánea 100ml. Ondansetrón IV.',
            nextVisit: '2026-01-05',
        }
    })

    console.log('✅ Sample appointment + medical record created')

    // --- Create a pending appointment (for testing OTP flow) ---
    await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: mishi.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'pending',
            serviceType: 'vaccination',
            commissionType: 'walkin',
            commissionAmount: 6.00,
            scheduledAt: new Date('2026-05-10T11:00:00'),
        }
    })

    console.log('✅ Pending appointment created (for OTP testing)')

    // --- Create Services (Tarifario) ---
    await prisma.service.createMany({
        data: [
            { establishmentId: clinic.id, name: 'Consulta General', price: 80, duration: 30, category: 'consultation', description: 'Revisión completa del paciente' },
            { establishmentId: clinic.id, name: 'Vacunación', price: 60, duration: 15, category: 'vaccination', description: 'Incluye vacuna y carnet' },
            { establishmentId: clinic.id, name: 'Desparasitación', price: 40, duration: 10, category: 'deworming' },
            { establishmentId: clinic.id, name: 'Cirugía menor', price: 350, duration: 90, category: 'surgery', description: 'Suturas, drenajes, biopsias' },
            { establishmentId: clinic.id, name: 'Esterilización', price: 280, duration: 120, category: 'surgery' },
            { establishmentId: clinic.id, name: 'Examen de sangre', price: 120, duration: 20, category: 'test', description: 'Hemograma completo + bioquímica' },
            { establishmentId: groomerShop.id, name: 'Baño completo', price: 50, duration: 45, category: 'bath', description: 'Baño + secado + perfume' },
            { establishmentId: groomerShop.id, name: 'Corte de raza', price: 80, duration: 60, category: 'grooming', description: 'Corte según estándar de raza' },
            { establishmentId: groomerShop.id, name: 'Spa Premium', price: 120, duration: 90, category: 'grooming', description: 'Baño terapéutico + corte + uñas + limpieza de oídos' },
            { establishmentId: groomerShop.id, name: 'Corte de uñas', price: 20, duration: 10, category: 'grooming' },
            { establishmentId: hospital.id, name: 'Consulta especializada', price: 150, duration: 45, category: 'consultation' },
            { establishmentId: hospital.id, name: 'Ecografía', price: 200, duration: 30, category: 'test' },
            { establishmentId: hospital.id, name: 'Radiografía', price: 180, duration: 20, category: 'test' },
            { establishmentId: walker.id, name: 'Paseo grupal (1h)', price: 25, duration: 60, category: 'walk', description: 'Grupos de máximo 4 perros' },
            { establishmentId: walker.id, name: 'Paseo individual (1h)', price: 45, duration: 60, category: 'walk' },
        ]
    })

    console.log('✅ Services created')

    // --- Create Transactions (sample financial data) ---
    const today = new Date().toISOString().split('T')[0]
    await prisma.transaction.createMany({
        data: [
            { profileId: vetUser.id, type: 'income', amount: 80, category: 'consultation', description: 'Consulta Firulais', date: today },
            { profileId: vetUser.id, type: 'income', amount: 280, category: 'surgery', description: 'Esterilización Persa', date: today },
            { profileId: vetUser.id, type: 'income', amount: 120, category: 'test', description: 'Hemograma paciente Luna', date: today },
            { profileId: vetUser.id, type: 'expense', amount: 500, category: 'supplies', description: 'Medicamentos del mes', date: today },
            { profileId: vetUser.id, type: 'expense', amount: 1200, category: 'rent', description: 'Alquiler local mayo', date: today },
        ]
    })

    console.log('✅ Transactions created')

    console.log('')
    console.log('==================================')
    console.log('🎉 Seed completed successfully!')
    console.log('==================================')
    console.log('')
    console.log('Test accounts:')
    console.log('  📧 Cliente:   cliente@brofy.pe / 123456')
    console.log('  📧 Vet:       vet@brofy.pe / 123456')
    console.log('  📧 Provider:  groomer@brofy.pe / 123456')
    console.log('')
    console.log(`QR Token (clinic): ${clinic.qrCodeToken}`)
    console.log(`URL: /checkin/${clinic.qrCodeToken}`)
    console.log('')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
