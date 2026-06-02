/**
 * BROFY — Script de Limpieza Absoluta para Producción
 * 
 * Este script borra por completo TODOS los datos de la base de datos de PostgreSQL (esquema public)
 * sin insertar ningún usuario de prueba ni clínicas ficticias.
 * Deja la base de datos 100% limpia y lista para recibir usuarios reales en producción.
 * 
 * USO: npm run db:clean
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Iniciando limpieza absoluta de la base de datos para Producción...')

    try {
        // Borrar en orden inverso de dependencias para respetar llaves foráneas (Cascade & FK Constraints)
        console.log('   🗑️  Borrando reseñas (Review)...')
        await prisma.review.deleteMany()

        console.log('   🗑️  Borrando reclamos (Claim)...')
        await prisma.claim.deleteMany()

        console.log('   🗑️  Borrando recordatorios (Reminder)...')
        await prisma.reminder.deleteMany()

        console.log('   🗑️  Borrando fichas médicas (MedicalRecord)...')
        await prisma.medicalRecord.deleteMany()

        console.log('   🗑️  Borrando citas (Appointment)...')
        await prisma.appointment.deleteMany()

        console.log('   🗑️  Borrando transacciones financieras (Transaction)...')
        await prisma.transaction.deleteMany()

        console.log('   🗑️  Borrando servicios de locales (Service)...')
        await prisma.service.deleteMany()

        console.log('   🗑️  Borrando mascotas (Pet)...')
        await prisma.pet.deleteMany()

        console.log('   🗑️  Borrando establecimientos (Establishment)...')
        await prisma.establishment.deleteMany()

        console.log('   🗑️  Borrando perfiles de usuario (Profile)...')
        await prisma.profile.deleteMany()

        console.log('')
        console.log('========================================================')
        console.log('🎉 ¡Base de datos del esquema público limpiada con éxito!')
        console.log('========================================================')
        console.log('💡 Nota: Para limpiar también los usuarios en Supabase Auth,')
        console.log('   puedes borrarlos desde el panel de control de Supabase.')
        console.log('========================================================')
        console.log('')
    } catch (error) {
        console.error('❌ Error durante la limpieza de la base de datos:', error)
        throw error
    }
}

main()
    .catch((e) => {
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
