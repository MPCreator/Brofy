/**
 * BROFY — Script de reinicio de base de datos
 * 
 * Borra TODOS los datos de prueba (citas, fichas, transacciones, mascotas, establecimientos)
 * y restaura el estado inicial limpio con:
 *   - admin@brofy.pe (Administrador)
 *   - vet@brofy.pe / Dr. Carlos Mendoza (Veterinario con clínica + servicios de demo)
 *   - cliente@brofy.pe / María López (Cliente con 2 mascotas)
 * 
 * USO: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/reset.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Reiniciando base de datos...')
    console.log('   Borrando datos existentes...')

    // Borrar en orden para respetar foreign keys
    await prisma.review.deleteMany()
    await prisma.claim.deleteMany()
    await prisma.medicalRecord.deleteMany()
    await prisma.appointment.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.service.deleteMany()
    await prisma.pet.deleteMany()
    await prisma.establishment.deleteMany()
    await prisma.profile.deleteMany()

    console.log('   ✅ Datos eliminados')
    console.log('   Creando cuentas base...')

    const pwd = await bcrypt.hash('123456', 10)

    // --- Admin ---
    await prisma.profile.create({
        data: {
            email: 'admin@brofy.pe',
            password: pwd,
            fullName: 'Administrador Brofy',
            role: 'admin',
        }
    })

    // --- Veterinario ---
    const vet = await prisma.profile.create({
        data: {
            email: 'vet@brofy.pe',
            password: pwd,
            fullName: 'Carlos Mendoza Ríos',
            role: 'vet',
            cmvpId: 'CMVP-12345',
            phone: '+51999333444',
            latitude: -12.0850,
            longitude: -77.0450,
        }
    })

    // --- Cliente ---
    const client = await prisma.profile.create({
        data: {
            email: 'cliente@brofy.pe',
            password: pwd,
            fullName: 'María López García',
            role: 'client',
            phone: '+51999111222',
            latitude: -12.0900,
            longitude: -77.0500,
        }
    })

    // --- Proveedor de Servicios ---
    const provider = await prisma.profile.create({
        data: {
            email: 'servicios@brofy.pe',
            password: pwd,
            fullName: 'Grooming & Spa Huellitas',
            role: 'provider',
            phone: '+51999444555',
            latitude: -12.1200,
            longitude: -77.0300,
        }
    })

    console.log('   ✅ Cuentas creadas')
    console.log('   Creando establecimientos de demo...')

    // --- Establecimiento de demo: Veterinaria ---
    const clinica = await prisma.establishment.create({
        data: {
            ownerId: vet.id,
            name: 'Clínica Veterinaria San Borja',
            address: 'Av. San Borja Norte 345, San Borja',
            district: 'San Borja',
            city: 'Lima',
            latitude: -12.0870,
            longitude: -77.0050,
            type: 'clinic',
            phone: '+5114567890',
            description: 'Clínica veterinaria con 15 años de experiencia. Atención integral para tu mascota.',
            rating: 0,
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

    // --- Establecimiento de demo: Servicios ---
    const spa = await prisma.establishment.create({
        data: {
            ownerId: provider.id,
            name: 'Huellitas Grooming & Pet Spa',
            address: 'Av. Larco 789, Miraflores',
            district: 'Miraflores',
            city: 'Lima',
            latitude: -12.1220,
            longitude: -77.0310,
            type: 'groomer',
            phone: '+5119876543',
            description: 'El mejor spa para tus engreídos. Baños medicados, corte de pelo estilizado y masajes relajantes.',
            rating: 5,
            operatingHours: JSON.stringify({
                mon: { open: '09:00', close: '18:00' },
                tue: { open: '09:00', close: '18:00' },
                wed: { open: '09:00', close: '18:00' },
                thu: { open: '09:00', close: '18:00' },
                fri: { open: '09:00', close: '18:00' },
                sat: { open: '09:00', close: '18:00' },
            }),
        }
    })

    // --- Servicios de demo: Veterinaria ---
    await prisma.service.createMany({
        data: [
            { establishmentId: clinica.id, name: 'Consulta General', price: 80, duration: 30, category: 'consultation', description: 'Revisión completa del paciente' },
            { establishmentId: clinica.id, name: 'Vacunación', price: 60, duration: 15, category: 'vaccination', description: 'Incluye vacuna y registro en carnet' },
            { establishmentId: clinica.id, name: 'Desparasitación', price: 40, duration: 15, category: 'deworming', description: 'Interna y externa' },
            { establishmentId: clinica.id, name: 'Examen de sangre', price: 120, duration: 20, category: 'test', description: 'Hemograma completo' },
            { establishmentId: clinica.id, name: 'Esterilización', price: 280, duration: 120, category: 'surgery', description: 'Incluye anestesia y seguimiento post-operatorio' },
        ]
    })

    // --- Servicios de demo: Spa & Servicios ---
    await prisma.service.createMany({
        data: [
            { establishmentId: spa.id, name: 'Grooming Completo Canino', price: 70, duration: 60, category: 'grooming', description: 'Baño, corte de pelo estilizado, corte de uñas y limpieza de oídos' },
            { establishmentId: spa.id, name: 'Baño Medicado Antipulgas', price: 45, duration: 45, category: 'grooming', description: 'Baño profundo con champú antiparasitario' },
            { establishmentId: spa.id, name: 'Paseo Grupal Dinámico', price: 25, duration: 90, category: 'walker', description: '90 minutos de recreación con paseador profesional certificado' },
            { establishmentId: spa.id, name: 'Hospedaje Pet Daycare (Día)', price: 90, duration: 480, category: 'other', description: 'Cuidado premium diurno con juegos y fotos en tiempo real' },
        ]
    })

    console.log('   ✅ Establecimientos y servicios de demo creados')

    // --- Mascotas del cliente de demo ---
    await prisma.pet.createMany({
        data: [
            {
                ownerId: client.id,
                name: 'Firulais',
                species: 'dog',
                breed: 'Golden Retriever',
                dateOfBirth: '2021-03-15',
                weight: 32.5,
                sex: 'male',
                medicalHistory: JSON.stringify([
                    {
                        date: '2025-01-05',
                        type: 'vaccination',
                        description: 'Vacuna Antirrábica (refuerzo anual)',
                        provider: 'Carlos Mendoza Ríos',
                        providerCmvp: 'CMVP-12345',
                    },
                ]),
            },
            {
                ownerId: client.id,
                name: 'Mishi',
                species: 'cat',
                breed: 'Persa',
                dateOfBirth: '2022-08-01',
                weight: 4.2,
                sex: 'female',
                medicalHistory: JSON.stringify([]),
            }
        ]
    })

    console.log('   ✅ Mascotas de demo creadas')

    console.log('')
    console.log('=======================================')
    console.log('🎉 ¡Base de datos reiniciada con éxito!')
    console.log('=======================================')
    console.log('')
    console.log('Cuentas disponibles (contraseña: 123456):')
    console.log('  👑 Admin:      admin@brofy.pe')
    console.log('  🩺 Vet:        vet@brofy.pe')
    console.log('  🏪 Servicios:  servicios@brofy.pe')
    console.log('  🐾 Cliente:    cliente@brofy.pe')
    console.log('')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
