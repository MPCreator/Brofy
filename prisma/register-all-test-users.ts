import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Parse .env manually
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env')
    if (!fs.existsSync(envPath)) {
        console.error('Error: .env file not found.')
        process.exit(1)
    }

    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars: Record<string, string> = {}
    
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        const parts = trimmed.split('=')
        if (parts.length >= 2) {
            const key = parts[0].trim()
            // Join back in case value contains '='
            const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '')
            envVars[key] = value
            process.env[key] = value
        }
    })
    return envVars
}

async function mergeGhostProfile(ghostId: string, realId: string) {
    console.log(`🔗 Migrando relaciones desde ID antiguo (${ghostId}) al nuevo ID de Supabase (${realId})...`)
    
    // 1. Pets (dueño)
    const petsUpdate = await prisma.pet.updateMany({
        where: { ownerId: ghostId },
        data: { ownerId: realId }
    })
    console.log(`   - Mascotas migradas: ${petsUpdate.count}`)

    // 2. Appointments (cliente y proveedor)
    const apptsClientUpdate = await prisma.appointment.updateMany({
        where: { clientId: ghostId },
        data: { clientId: realId }
    })
    const apptsProvUpdate = await prisma.appointment.updateMany({
        where: { providerId: ghostId },
        data: { providerId: realId }
    })
    console.log(`   - Citas como cliente migradas: ${apptsClientUpdate.count}`)
    console.log(`   - Citas como proveedor migradas: ${apptsProvUpdate.count}`)

    // 3. Reminders
    const remClientUpdate = await prisma.reminder.updateMany({
        where: { clientId: ghostId },
        data: { clientId: realId }
    })
    const remCreatorUpdate = await prisma.reminder.updateMany({
        where: { createdBy: ghostId },
        data: { createdBy: realId }
    })
    console.log(`   - Recordatorios de cliente migrados: ${remClientUpdate.count}`)
    console.log(`   - Recordatorios creados migrados: ${remCreatorUpdate.count}`)

    // 4. Transactions
    const txUpdate = await prisma.transaction.updateMany({
        where: { profileId: ghostId },
        data: { profileId: realId }
    })
    console.log(`   - Transacciones financieras migradas: ${txUpdate.count}`)

    // 5. Reviews
    const reviewUpdate = await prisma.review.updateMany({
        where: { clientId: ghostId },
        data: { clientId: realId }
    })
    console.log(`   - Reseñas migradas: ${reviewUpdate.count}`)

    // 6. Establishments
    const estUpdate = await prisma.establishment.updateMany({
        where: { ownerId: ghostId },
        data: { ownerId: realId }
    })
    console.log(`   - Establecimientos migrados: ${estUpdate.count}`)

    // 7. Medical Records (vetId)
    const mrUpdate = await prisma.medicalRecord.updateMany({
        where: { vetId: ghostId },
        data: { vetId: realId }
    })
    console.log(`   - Historiales médicos migrados: ${mrUpdate.count}`)

    // 8. Audit Logs (actorId)
    const auditUpdate = await prisma.auditLog.updateMany({
        where: { actorId: ghostId },
        data: { actorId: realId }
    })
    console.log(`   - Registros de auditoría migrados: ${auditUpdate.count}`)

    // 9. Borrar el perfil viejo/fantasma
    await prisma.profile.delete({
        where: { id: ghostId }
    })
    console.log(`   - Perfil antiguo eliminado.`)
}

async function run() {
    console.log('🔄 Cargando variables de entorno...')
    const env = loadEnv()
    
    const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
    const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
    
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Error: NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY faltan en el archivo .env')
        process.exit(1)
    }

    console.log('⚡ Inicializando cliente de Supabase...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const testUsers = [
        { email: 'admin@brofy.pe', fullName: 'Administrador Brofy', role: 'admin' },
        { email: 'cliente@brofy.pe', fullName: 'María López García', role: 'client' },
        { email: 'vet@brofy.pe', fullName: 'Dr. Carlos Mendoza Ríos', role: 'vet', cmvpId: 'CMVP-12345', cmvpValidated: true },
        { email: 'servicios@brofy.pe', fullName: 'Ana Ríos Pet Spa', role: 'provider' }
    ]

    const password = '123456'

    for (const user of testUsers) {
        console.log(`\n--------------------------------------------------`)
        console.log(`👤 Procesando usuario: ${user.email} (${user.role})`)
        
        let newUserId: string | undefined = undefined

        // Intentar registrar en Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: user.email,
            password,
            options: {
                data: {
                    full_name: user.fullName,
                    role: user.role
                }
            }
        })

        if (signUpError) {
            if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
                console.log(`   ℹ️ El usuario ya está registrado en Supabase. Obteniendo ID mediante login...`)
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password
                })
                if (signInError) {
                    console.error(`   ❌ Error al iniciar sesión en Supabase para ${user.email}:`, signInError.message)
                    continue
                }
                newUserId = signInData.user?.id
            } else {
                console.error(`   ❌ Error al registrar en Supabase para ${user.email}:`, signUpError.message)
                continue
            }
        } else {
            newUserId = signUpData.user?.id
        }

        if (!newUserId) {
            console.error(`   ❌ No se pudo recuperar el ID de Supabase para ${user.email}`)
            continue
        }

        console.log(`   ✅ Supabase UID recuperado: ${newUserId}`)

        // Verificar si ya existe el perfil en Prisma con el UID correcto
        const existingProfileById = await prisma.profile.findUnique({
            where: { id: newUserId }
        })

        if (existingProfileById) {
            console.log(`   🔄 Perfil ya sincronizado en la base de datos local con el UID de Supabase. Actualizando datos...`)
            await prisma.profile.update({
                where: { id: newUserId },
                data: {
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    cmvpId: user.cmvpId || null,
                    cmvpValidated: user.cmvpValidated || false,
                    isActive: true
                }
            })
            console.log(`   🎉 Perfil actualizado exitosamente.`)
        } else {
            // Verificar si existe un perfil con el mismo correo electrónico (creado con un ID aleatorio por el seed)
            const existingProfileByEmail = await prisma.profile.findUnique({
                where: { email: user.email }
            })

            if (existingProfileByEmail) {
                console.log(`   🔄 Perfil semilla detectado por email (ID antiguo: ${existingProfileByEmail.id}). Sincronizando...`)
                
                // 1. Liberar la restricción del email único
                await prisma.profile.update({
                    where: { id: existingProfileByEmail.id },
                    data: { email: `old_${Date.now()}_${user.email}` }
                })

                // 2. Crear el perfil con el ID correcto de Supabase
                await prisma.profile.create({
                    data: {
                        id: newUserId,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        cmvpId: user.cmvpId || null,
                        cmvpValidated: user.cmvpValidated || false,
                        isActive: true,
                        password: 'supabase-auth-managed'
                    }
                })

                // 3. Migrar relaciones y eliminar el antiguo perfil
                await mergeGhostProfile(existingProfileByEmail.id, newUserId)
                console.log(`   🎉 Sincronización de perfil finalizada con éxito para ${user.email}.`)
            } else {
                // Si no existe, creamos el perfil directamente con el ID de Supabase
                await prisma.profile.create({
                    data: {
                        id: newUserId,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        cmvpId: user.cmvpId || null,
                        cmvpValidated: user.cmvpValidated || false,
                        isActive: true,
                        password: 'supabase-auth-managed'
                    }
                })
                console.log(`   🎉 Perfil insertado exitosamente directamente con ID de Supabase.`)
            }
        }
    }

    console.log('\n==================================================')
    console.log('🎉 PROCESO DE REGISTRO Y SINCRONIZACIÓN DE USUARIOS COMPLETADO!')
    console.log('==================================================')
    console.log('Cuentas de prueba listas para iniciar sesión (Contraseña: 123456):')
    console.log('  👑 Admin:      admin@brofy.pe')
    console.log('  🐾 Cliente:    cliente@brofy.pe')
    console.log('  🩺 Veterinario: vet@brofy.pe')
    console.log('  🏪 Servicios:   servicios@brofy.pe')
    console.log('==================================================\n')
}

run()
    .catch(e => {
        console.error('❌ Error no controlado en la ejecución:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
