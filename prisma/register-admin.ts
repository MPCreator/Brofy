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

async function run() {
    console.log('🔄 Loading environment variables...')
    const env = loadEnv()
    
    const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
    const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
    
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from .env')
        process.exit(1)
    }

    console.log('⚡ Initializing Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const email = 'admin@brofy.pe'
    const password = '123456'

    console.log(`👤 Attempting to register ${email} in Supabase Auth...`)
    let newUserId: string | undefined = undefined;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Administrador Brofy',
                role: 'admin'
            }
        }
    })

    if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
            console.log('ℹ️ User already registered in Supabase Auth. Retrieving existing user ID via signIn...')
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            if (signInError) {
                console.error('❌ Supabase Auth signIn error:', signInError.message)
                process.exit(1)
            }
            newUserId = signInData.user?.id
        } else {
            console.error('❌ Supabase Auth signUp error:', signUpError.message)
            process.exit(1)
        }
    } else {
        newUserId = signUpData.user?.id
    }

    if (!newUserId) {
        console.error('❌ Failed to retrieve user ID from Supabase response.')
        process.exit(1)
    }

    console.log(`✅ Supabase user registered successfully. ID: ${newUserId}`)

    console.log('📦 Updating Prisma database profile...')
    
    // Check if profile exists by email
    const existingProfile = await prisma.profile.findUnique({
        where: { email }
    })

    if (existingProfile) {
        console.log(`🔄 Profile found in Prisma (Old ID: ${existingProfile.id}). Deleting old profile and creating sync profile with ID: ${newUserId}`)
        
        // Remove unique constraint lock by renaming email temporarily
        await prisma.profile.update({
            where: { id: existingProfile.id },
            data: { email: `old_seed_admin_${Date.now()}@brofy.pe` }
        })

        // Create new profile with Supabase ID
        await prisma.profile.create({
            data: {
                id: newUserId,
                email,
                fullName: 'Administrador Brofy',
                role: 'admin',
                password: 'supabase-auth-managed',
                isActive: true
            }
        })

        // Transfer any logs or relations from old profile to new one (if any exist)
        await prisma.auditLog.updateMany({
            where: { actorId: existingProfile.id },
            data: { actorId: newUserId }
        })

        // Delete the old profile
        await prisma.profile.delete({
            where: { id: existingProfile.id }
        })

        console.log('🎉 Admin profile updated and synced successfully.')
    } else {
        // Create new profile directly
        await prisma.profile.create({
            data: {
                id: newUserId,
                email,
                fullName: 'Administrador Brofy',
                role: 'admin',
                password: 'supabase-auth-managed',
                isActive: true
            }
        })
        console.log('🎉 Admin profile inserted successfully.')
    }

    console.log('\n--- SUCCESS SUMMARY ---')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Supabase UID: ${newUserId}`)
    console.log('You can now log in to the dashboard!')
}

run()
    .catch(e => {
        console.error('❌ Unhandled error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
