import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Empezando limpieza selectiva de mascotas y locales de prueba...')

  // 1. Encontrar los perfiles por sus correos
  const clientUser = await prisma.profile.findUnique({
    where: { email: 'cliente@brofy.pe' }
  })
  const vetUser = await prisma.profile.findUnique({
    where: { email: 'vet@brofy.pe' }
  })
  const providerUser = await prisma.profile.findUnique({
    where: { email: 'servicios@brofy.pe' }
  })

  // --- MIGRAR O BORRAR PARA EL CLIENTE ---
  if (clientUser) {
    console.log(`🧹 Limpiando datos de cliente: ${clientUser.email}...`)
    // Borrar recordatorios del cliente
    await prisma.reminder.deleteMany({
      where: { clientId: clientUser.id }
    })
    // Borrar reseñas del cliente
    await prisma.review.deleteMany({
      where: { clientId: clientUser.id }
    })
    // Borrar citas del cliente (y cascade borrará fichas médicas)
    await prisma.appointment.deleteMany({
      where: { clientId: clientUser.id }
    })
    // Borrar mascotas
    await prisma.pet.deleteMany({
      where: { ownerId: clientUser.id }
    })
    console.log('   ✅ Cliente limpio (0 mascotas, 0 citas). Ready for onboarding.')
  }

  // --- MIGRAR O BORRAR PARA EL VET ---
  if (vetUser) {
    console.log(`🧹 Limpiando datos de vet: ${vetUser.email}...`)
    // Borrar citas que referencien establecimientos del veterinario
    await prisma.appointment.deleteMany({
      where: { establishment: { ownerId: vetUser.id } }
    })
    // Borrar recordatorios creados por el veterinario
    await prisma.reminder.deleteMany({
      where: { createdBy: vetUser.id }
    })
    // Borrar transacciones del veterinario
    await prisma.transaction.deleteMany({
      where: { profileId: vetUser.id }
    })
    // Borrar servicios del veterinario
    await prisma.service.deleteMany({
      where: { establishment: { ownerId: vetUser.id } }
    })
    // Borrar locales (establecimientos) del veterinario
    await prisma.establishment.deleteMany({
      where: { ownerId: vetUser.id }
    })
    console.log('   ✅ Vet limpio (0 locales). Ready for onboarding.')
  }

  // --- MIGRAR O BORRAR PARA EL PROVEEDOR ---
  if (providerUser) {
    console.log(`🧹 Limpiando datos de proveedor: ${providerUser.email}...`)
    // Borrar citas de establecimientos del proveedor
    await prisma.appointment.deleteMany({
      where: { establishment: { ownerId: providerUser.id } }
    })
    // Borrar recordatorios creados por el proveedor
    await prisma.reminder.deleteMany({
      where: { createdBy: providerUser.id }
    })
    // Borrar transacciones del proveedor
    await prisma.transaction.deleteMany({
      where: { profileId: providerUser.id }
    })
    // Borrar servicios del proveedor
    await prisma.service.deleteMany({
      where: { establishment: { ownerId: providerUser.id } }
    })
    // Borrar locales (establecimientos) del proveedor
    await prisma.establishment.deleteMany({
      where: { ownerId: providerUser.id }
    })
    console.log('   ✅ Proveedor limpio (0 locales). Ready for onboarding.')
  }

  console.log('🎉 Limpieza selectiva finalizada exitosamente. Puedes probar el flujo de inducción con cliente@brofy.pe, vet@brofy.pe o servicios@brofy.pe usando la contraseña 123456.')
}

main()
  .catch((e) => {
    console.error('❌ Error durante la limpieza selectiva:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
