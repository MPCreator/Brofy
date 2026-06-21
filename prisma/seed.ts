import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Cloudinary image resolution helper (always use 'demo' for mock/seed assets to guarantee they load)
const cloudName = 'demo';

const getCloudinaryUrl = (publicId: string) => `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`;

async function main() {
    console.log('🌱 Seeding database with Cloudinary assets and rich profiles...')

    // Clean existing data in correct order to respect foreign key constraints
    await prisma.review.deleteMany()
    await prisma.claim.deleteMany()
    await prisma.reminder.deleteMany()
    await prisma.medicalRecord.deleteMany()
    await prisma.appointment.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.service.deleteMany()
    await prisma.pet.deleteMany()
    await prisma.establishment.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.auditLog.deleteMany()

    console.log('🧹 Cleaned existing database records (including Audit Logs)')

    // --- Create Profiles ---
    const hashedPassword = await bcrypt.hash('123456', 10)

    // 1. Admin
    const adminUser = await prisma.profile.create({
        data: {
            email: 'admin@brofy.pe',
            password: hashedPassword,
            fullName: 'Administrador Brofy',
            role: 'admin',
        }
    })

    // 2. Client
    const clientUser = await prisma.profile.create({
        data: {
            email: 'cliente@brofy.pe',
            password: hashedPassword,
            fullName: 'María López García',
            role: 'client',
            phone: '+51999111222',
            avatarUrl: getCloudinaryUrl('samples/people/smiling-man'),
            latitude: -12.0900,
            longitude: -77.0500,
        }
    })

    // 3. Veterinarian
    const vetUser = await prisma.profile.create({
        data: {
            email: 'vet@brofy.pe',
            password: hashedPassword,
            fullName: 'Dr. Carlos Mendoza Ríos',
            role: 'vet',
            cmvpId: 'CMVP-12345',
            cmvpValidated: true,
            phone: '+51999333444',
            avatarUrl: getCloudinaryUrl('samples/people/doctor'),
            latitude: -12.0850,
            longitude: -77.0450,
        }
    })

    // 4. Service Provider
    const providerUser = await prisma.profile.create({
        data: {
            email: 'servicios@brofy.pe',
            password: hashedPassword,
            fullName: 'Ana Ríos Pet Spa',
            role: 'provider',
            phone: '+51999555666',
            avatarUrl: getCloudinaryUrl('samples/people/girl-picture'),
            latitude: -12.1000,
            longitude: -77.0300,
        }
    })

    console.log('✅ Profiles created (Admin, Client, Vet, Provider)')

    // --- Create Establishments ---
    // A. Clínica Veterinaria San Borja (Clinic)
    const clinic = await prisma.establishment.create({
        data: {
            ownerId: vetUser.id,
            name: 'Clínica Veterinaria San Borja',
            address: 'Av. San Borja Norte 345, San Borja',
            district: 'San Borja',
            city: 'Lima',
            latitude: -12.0870,
            longitude: -77.0050,
            type: 'clinic',
            phone: '+5114567890',
            description: 'Clínica veterinaria con 15 años de experiencia. Atención integral 24/7 para emergencias.',
            rating: 4.8,
            logoUrl: getCloudinaryUrl('samples/people/doctor'),
            photoUrl: getCloudinaryUrl('samples/landscapes/architecture-interior'),
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

    // B. Huellitas Grooming & Pet Spa (Groomer)
    const groomerShop = await prisma.establishment.create({
        data: {
            ownerId: providerUser.id,
            name: 'Huellitas Grooming & Pet Spa',
            address: 'Av. Larco 789, Miraflores',
            district: 'Miraflores',
            city: 'Lima',
            latitude: -12.1220,
            longitude: -77.0310,
            type: 'groomer',
            phone: '+5119876543',
            description: 'Grooming de lujo para tu mascota. Baños terapéuticos y cortes de raza.',
            rating: 4.5,
            logoUrl: getCloudinaryUrl('samples/people/girl-picture'),
            photoUrl: getCloudinaryUrl('samples/indoor-flowers'),
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

    // C. Hospital Veterinario de Lima (Hospital)
    const hospital = await prisma.establishment.create({
        data: {
            ownerId: vetUser.id,
            name: 'Hospital Veterinario de Lima',
            address: 'Av. Javier Prado Este 1234, La Molina',
            district: 'La Molina',
            city: 'Lima',
            latitude: -12.0780,
            longitude: -76.9500,
            type: 'hospital',
            phone: '+5113456789',
            description: 'Hospital especializado con quirófano, UCI y laboratorio clínico.',
            rating: 4.9,
            logoUrl: getCloudinaryUrl('samples/people/doctor'),
            photoUrl: getCloudinaryUrl('samples/landscapes/architecture-interior'),
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

    // D. PaseosPro Lima (Walker)
    const walker = await prisma.establishment.create({
        data: {
            ownerId: providerUser.id,
            name: 'PaseosPro Lima',
            address: 'Parque Kennedy, Miraflores',
            district: 'Miraflores',
            city: 'Lima',
            latitude: -12.1190,
            longitude: -77.0290,
            type: 'walker',
            phone: '+51987654321',
            description: 'Paseos seguros y divertidos. Grupos pequeños, GPS en tiempo real.',
            rating: 4.3,
            logoUrl: getCloudinaryUrl('samples/people/girl-picture'),
            photoUrl: getCloudinaryUrl('samples/landscapes/nature-mountains'),
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

    console.log('✅ Establishments created (Clinic, Groomer, Hospital, Walker)')

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
            photoUrl: getCloudinaryUrl('samples/animals/dog'),
            medicalHistory: JSON.stringify([
                {
                    date: '2025-01-05',
                    type: 'vaccination',
                    description: 'Vacuna Antirrábica (refuerzo anual)',
                    provider: 'Dr. Carlos Mendoza Ríos',
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
            photoUrl: getCloudinaryUrl('samples/animals/cat'),
            medicalHistory: JSON.stringify([]),
        }
    })

    const luna = await prisma.pet.create({
        data: {
            ownerId: clientUser.id,
            name: 'Luna',
            species: 'dog',
            breed: 'Labrador Retriever',
            dateOfBirth: '2023-05-10',
            weight: 28.0,
            sex: 'female',
            photoUrl: getCloudinaryUrl('samples/animals/dog'),
            medicalHistory: JSON.stringify([]),
        }
    })

    const tom = await prisma.pet.create({
        data: {
            ownerId: clientUser.id,
            name: 'Tom',
            species: 'cat',
            breed: 'Siamés',
            dateOfBirth: '2024-01-20',
            weight: 3.8,
            sex: 'male',
            photoUrl: getCloudinaryUrl('samples/animals/cat'),
            medicalHistory: JSON.stringify([]),
        }
    })

    console.log('✅ Pets created (Firulais, Mishi, Luna, Tom)')

    // --- Create Services (Tarifario) ---
    await prisma.service.createMany({
        data: [
            { establishmentId: clinic.id, name: 'Consulta General', price: 80, duration: 30, category: 'consultation', description: 'Revisión completa del paciente', operatingDays: '["mon","tue","wed","thu","fri","sat"]', operatingHours: '{"start":"08:00","end":"20:00"}', workOnHolidays: false },
            { establishmentId: clinic.id, name: 'Vacunación Completa', price: 60, duration: 15, category: 'vaccination', description: 'Incluye vacuna antirrábica y registro', operatingDays: '["mon","tue","wed","thu","fri","sat"]', operatingHours: '{"start":"08:00","end":"20:00"}', workOnHolidays: false },
            { establishmentId: clinic.id, name: 'Desparasitación Interna', price: 40, duration: 15, category: 'deworming', description: 'Tratamiento antiparasitario interno', operatingDays: '["mon","tue","wed","thu","fri","sat"]', operatingHours: '{"start":"08:00","end":"20:00"}', workOnHolidays: false },
            { establishmentId: clinic.id, name: 'Examen de Sangre', price: 120, duration: 20, category: 'test', description: 'Hemograma completo', operatingDays: '["mon","tue","wed","thu","fri"]', operatingHours: '{"start":"08:00","end":"17:00"}', workOnHolidays: false },
            { establishmentId: clinic.id, name: 'Esterilización Especializada', price: 280, duration: 120, category: 'surgery', description: 'Incluye anestesia y post-operatorio', operatingDays: '["mon","wed","fri"]', operatingHours: '{"start":"09:00","end":"13:00"}', workOnHolidays: false },
            
            { establishmentId: groomerShop.id, name: 'Grooming Completo Canino', price: 70, duration: 60, category: 'grooming', description: 'Baño, corte de pelo estilizado, corte de uñas y limpieza de oídos', operatingDays: '["mon","tue","wed","thu","fri","sat","sun"]', operatingHours: '{"start":"09:00","end":"18:00"}', workOnHolidays: false },
            { establishmentId: groomerShop.id, name: 'Baño Medicado Antipulgas', price: 45, duration: 45, category: 'grooming', description: 'Baño profundo con champú antiparasitario', operatingDays: '["mon","tue","wed","thu","fri","sat","sun"]', operatingHours: '{"start":"09:00","end":"18:00"}', workOnHolidays: false },
            
            { establishmentId: hospital.id, name: 'Consulta Veterinaria Especializada', price: 150, duration: 45, category: 'consultation', description: 'Atención por especialistas cirujanos o cardiólogos', operatingDays: '["mon","tue","wed","thu","fri","sat","sun"]', operatingHours: '{"start":"00:00","end":"23:59"}', workOnHolidays: true },
            { establishmentId: hospital.id, name: 'Ecografía Abdominal Completa', price: 200, duration: 30, category: 'test', description: 'Estudio de imágenes de alta resolución', operatingDays: '["mon","tue","wed","thu","fri","sat","sun"]', operatingHours: '{"start":"08:00","end":"22:00"}', workOnHolidays: true },
            
            { establishmentId: walker.id, name: 'Paseo Grupal Dinámico', price: 25, duration: 90, category: 'walk', description: '90 minutos de recreación con paseador profesional certificado', operatingDays: '["sat","sun"]', operatingHours: '{"start":"07:00","end":"11:00"}', workOnHolidays: true },
            { establishmentId: walker.id, name: 'Hospedaje Pet Daycare (Día)', price: 90, duration: 480, category: 'general', description: 'Cuidado premium diurno con juegos y fotos en tiempo real', operatingDays: '["mon","tue","wed","thu","fri","sat","sun"]', operatingHours: '{"start":"08:00","end":"18:00"}', workOnHolidays: true },
        ]
    })

    console.log('✅ Services created')

    // --- Create Appointments & Medical Records ---
    // 1. Completed appointment + medical record for Firulais
    const completedApt = await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: firulais.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'completed',
            serviceType: 'Consulta General',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '123456',
            paymentId: 'pay_brofy_001_seed',
            notes: 'Revisión periódica de vacunas',
            scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
            totalServicePrice: 80.00
        }
    })

    await prisma.medicalRecord.create({
        data: {
            appointmentId: completedApt.id,
            vetId: vetUser.id,
            weight: 32.5,
            temperature: 38.6,
            heartRate: 90,
            symptoms: JSON.stringify(['Letargia', 'Inapetencia']),
            diagnosis: 'Dermatitis alérgica leve',
            prescription: 'Prednisolona 5mg, 1 tableta cada 12 horas por 7 días.\nShampoo de avena en cada baño.',
            treatment: 'Limpieza de zona afectada y aplicación de crema calmante.',
            nextVisit: '2026-06-15',
        }
    })

    // 2. Paid appointment (pending attendance validation with OTP) for Mishi
    await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: mishi.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'paid',
            serviceType: 'Vacunación Completa',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '887766',
            paymentId: 'pay_brofy_002_seed',
            scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in the future
            totalServicePrice: 60.00
        }
    })

    // Today's scheduled appointment for Luna (pending verification)
    const todayMorning = new Date();
    todayMorning.setHours(10, 15, 0, 0);
    await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: luna.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'paid',
            serviceType: 'Consulta General',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '445566',
            paymentId: 'pay_brofy_004_seed',
            scheduledAt: todayMorning,
            totalServicePrice: 80.00
        }
    })

    // Walk-in appointment for Luna (waiting list) created today (1 hour ago)
    await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: luna.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'paid',
            serviceType: 'Desparasitación Interna',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '223344',
            paymentId: 'pay_brofy_005_seed',
            scheduledAt: null, // Walk-in / fast entry
            createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            totalServicePrice: 40.00
        }
    })

    // Walk-in appointment for Tom (waiting list) created today (2 hours ago)
    await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: tom.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'paid',
            serviceType: 'Consulta General',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '334455',
            paymentId: 'pay_brofy_006_seed',
            scheduledAt: null, // Walk-in / fast entry
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            totalServicePrice: 80.00
        }
    })

    // Cita pendiente vencida para Firulais (2 días atrás) - Elegible para cancelar/reportar inasistencia
    await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: firulais.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'paid',
            serviceType: 'Consulta General',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '777666',
            paymentId: 'pay_brofy_008_seed',
            scheduledAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
            totalServicePrice: 80.00
        }
    })

    // Cita pendiente vencida para Mishi (ayer) - Elegible para cancelar/reportar inasistencia
    await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: mishi.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'paid',
            serviceType: 'Vacunación Completa',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '666555',
            paymentId: 'pay_brofy_009_seed',
            scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            totalServicePrice: 60.00
        }
    })

    // Cancelled appointment (no-show) for Mishi scheduled 2 days ago
    await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: mishi.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'cancelled',
            serviceType: 'Vacunación Completa',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '556677',
            paymentId: 'pay_brofy_007_seed',
            scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            totalServicePrice: 60.00,
            notes: 'Inasistencia del cliente reportada por el especialista.'
        }
    })

    // 3. Completed Grooming appointment for Firulais at Spa
    const groomingApt = await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: firulais.id,
            establishmentId: groomerShop.id,
            providerId: providerUser.id,
            status: 'completed',
            serviceType: 'Grooming Completo Canino',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '112233',
            paymentId: 'pay_brofy_003_seed',
            notes: 'Corte de pelo bajo de raza Golden',
            scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
            totalServicePrice: 70.00
        }
    })

    // Create a review for the completed grooming appointment
    await prisma.review.create({
        data: {
            appointmentId: groomingApt.id,
            clientId: clientUser.id,
            establishmentId: groomerShop.id,
            rating: 5,
            comment: 'Excelente servicio. Firulais quedó súper limpio y oliendo delicioso. Lo recomiendo ampliamente!'
        }
    })

    // Review for Clínica Veterinaria San Borja
    await prisma.review.create({
        data: {
            appointmentId: completedApt.id,
            clientId: clientUser.id,
            establishmentId: clinic.id,
            rating: 5,
            comment: 'Excelente atención del Dr. Carlos Mendoza. Muy profesional, paciente con Firulais y resolvió todas mis dudas sobre su alergia.'
        }
    })

    console.log('✅ Appointments, Medical Records and Reviews created')

    // --- Create Reminders ---
    await prisma.reminder.createMany({
        data: [
            {
                clientId: clientUser.id,
                petId: firulais.id,
                createdBy: vetUser.id,
                type: 'control',
                title: 'Control de Alergia Dermatológica',
                message: 'Traer a Firulais para control veterinario por su dermatitis.',
                dueDate: '2026-06-15',
                isCompleted: false
            },
            {
                clientId: clientUser.id,
                petId: mishi.id,
                createdBy: clientUser.id,
                type: 'vaccination',
                title: 'Refuerzo de Vacuna Triple Felina',
                message: 'Toca vacuna anual.',
                dueDate: '2026-07-01',
                isCompleted: false
            }
        ]
    })

    console.log('✅ Reminders created')

    // --- Create Transactions (Finances for Vet & Provider) ---
    const todayStr = new Date().toISOString().split('T')[0]
    const getPastDateStr = (daysAgo: number) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
    }
    
    // Vet User Finances
    await prisma.transaction.createMany({
        data: [
            { profileId: vetUser.id, type: 'income', amount: 80, category: 'consultation', description: 'Consulta Médica Firulais', date: todayStr },
            { profileId: vetUser.id, type: 'income', amount: 150, category: 'consultation', description: 'Consulta Especializada Hospital', date: todayStr },
            { profileId: vetUser.id, type: 'expense', amount: 500, category: 'supplies', description: 'Fármacos y vacunas antirrábicas', date: todayStr },
            { profileId: vetUser.id, type: 'expense', amount: 1200, category: 'rent', description: 'Pago de alquiler clínica', date: todayStr },
            // Past transactions (richer history)
            { profileId: vetUser.id, type: 'income', amount: 80, category: 'consultation', description: 'Consulta General Canina', date: getPastDateStr(1) },
            { profileId: vetUser.id, type: 'income', amount: 60, category: 'vaccination', description: 'Vacuna quíntuple Toby', date: getPastDateStr(1) },
            { profileId: vetUser.id, type: 'income', amount: 120, category: 'test', description: 'Examen de Sangre - Hemograma', date: getPastDateStr(2) },
            { profileId: vetUser.id, type: 'income', amount: 280, category: 'surgery', description: 'Esterilización Gata Luna', date: getPastDateStr(3) },
            { profileId: vetUser.id, type: 'expense', amount: 150, category: 'supplies', description: 'Insumos descartables y jeringas', date: getPastDateStr(2) },
            { profileId: vetUser.id, type: 'income', amount: 80, category: 'consultation', description: 'Consulta control dermatitis', date: getPastDateStr(4) },
            { profileId: vetUser.id, type: 'income', amount: 40, category: 'deworming', description: 'Desparasitación interna Mishi', date: getPastDateStr(5) },
        ]
    })

    // Provider User Finances
    await prisma.transaction.createMany({
        data: [
            { profileId: providerUser.id, type: 'income', amount: 70, category: 'grooming', description: 'Grooming Completo Firulais', date: todayStr },
            { profileId: providerUser.id, type: 'income', amount: 45, category: 'grooming', description: 'Baño Medicado Caniche', date: todayStr },
            { profileId: providerUser.id, type: 'expense', amount: 120, category: 'supplies', description: 'Shampoo antiparasitario y toallas', date: todayStr },
            // Past transactions
            { profileId: providerUser.id, type: 'income', amount: 70, category: 'grooming', description: 'Corte Schnauzer Max', date: getPastDateStr(1) },
            { profileId: providerUser.id, type: 'income', amount: 70, category: 'grooming', description: 'Grooming completo Golden Luna', date: getPastDateStr(2) },
            { profileId: providerUser.id, type: 'income', amount: 25, category: 'walk', description: 'Paseo grupal de fin de semana', date: getPastDateStr(3) },
            { profileId: providerUser.id, type: 'expense', amount: 80, category: 'supplies', description: 'Correas y accesorios de paseo', date: getPastDateStr(2) },
        ]
    })

    console.log('✅ Financial transactions created for specialists')

    // --- Create Audit Logs ---
    await prisma.auditLog.createMany({
        data: [
            {
                actorId: adminUser.id,
                actorName: 'Administrador Brofy',
                actorEmail: 'admin@brofy.pe',
                action: 'VALIDATE_CMVP',
                targetId: vetUser.id,
                details: 'Se aprobó la colegiatura CMVP del veterinario Dr. Carlos Mendoza Ríos (vet@brofy.pe)'
            },
            {
                actorId: adminUser.id,
                actorName: 'Administrador Brofy',
                actorEmail: 'admin@brofy.pe',
                action: 'REACTIVATE_USER',
                targetId: providerUser.id,
                details: 'Se reactivó la cuenta del usuario Ana Ríos Pet Spa (servicios@brofy.pe)'
            },
            {
                actorId: clientUser.id,
                actorName: 'María López García',
                actorEmail: 'cliente@brofy.pe',
                action: 'CANCEL_APPOINTMENT',
                targetId: '7cc08d7e-2d24-4b14-b1b3-c06d02ac78d6',
                details: 'El cliente canceló la cita por motivos personales. Reembolso devuelto a billetera: S/ 5.00'
            },
            {
                actorId: vetUser.id,
                actorName: 'Dr. Carlos Mendoza Ríos',
                actorEmail: 'vet@brofy.pe',
                action: 'REPORT_NO_SHOW',
                targetId: '8cc08d7e-2d24-4b14-b1b3-c06d02ac78d7',
                details: 'El veterinario reportó inasistencia (No-Show) del cliente para la cita 8cc08d7e. Cita cancelada.'
            },
            {
                actorId: adminUser.id,
                actorName: 'Administrador Brofy',
                actorEmail: 'admin@brofy.pe',
                action: 'RESOLVE_DISPUTE',
                targetId: '9cc08d7e-2d24-4b14-b1b3-c06d02ac78d8',
                details: 'Disputa de cita 9cc08d7e resuelta A FAVOR DEL CLIENTE. Reembolso: S/ 5.00. Sanción al proveedor: SÍ'
            },
            {
                actorId: adminUser.id,
                actorName: 'Administrador Brofy',
                actorEmail: 'admin@brofy.pe',
                action: 'SEND_CUSTOM_EMAIL',
                targetId: clientUser.id,
                details: 'Se envió un correo electrónico personalizado a María López García (cliente@brofy.pe). Asunto: "Actualización de Políticas de Reembolso"'
            }
        ]
    })

    console.log('✅ Audit logs created')
    console.log('==================================================')
    console.log('🎉 Seeding successfully completed!')
    console.log('==================================================')
    console.log('')
    console.log('Test Accounts (Password: 123456):')
    console.log('  👑 Admin:      admin@brofy.pe')
    console.log('  🐾 Cliente:    cliente@brofy.pe')
    console.log('  🩺 Vet:        vet@brofy.pe')
    console.log('  🏪 Servicios:  servicios@brofy.pe')
    console.log('')
    console.log(`QR Checkin Token (San Borja): ${clinic.qrCodeToken}`)
    console.log(`Checkin URL: /checkin/${clinic.qrCodeToken}`)
    console.log('')
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
