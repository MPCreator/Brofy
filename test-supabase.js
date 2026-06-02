const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Leer .env manualmente
const envPath = path.resolve(__dirname, '.env')
console.log('Leyendo .env manualmente desde:', envPath)

let supabaseUrl = ''
let supabaseAnonKey = ''

try {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const lines = envContent.split('\n')
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].replace(/"/g, '').replace(/'/g, '').trim()
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1].replace(/"/g, '').replace(/'/g, '').trim()
    }
  }
} catch (err) {
  console.error('Error al leer .env:', err.message)
}

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0)
console.log('Supabase Anon Key value (primeros 15 chars):', supabaseAnonKey ? supabaseAnonKey.substring(0, 15) : 'N/A')

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('REEMPLAZAR')) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY o URL no configuradas correctamente en .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('Cliente de Supabase inicializado correctamente')

async function runTest() {
  console.log('Iniciando prueba de signUp...')
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test_temp_' + Date.now() + '@gmail.com',
      password: 'password123', options: { emailRedirectTo: 'https://brofy-phi.vercel.app/api/auth/callback' }
    })
    
    console.log('Llamada finalizada!')
    if (error) {
      console.error('Supabase error de respuesta:', error.message)
    } else {
      console.log('Supabase éxito de respuesta! User ID:', data.user ? data.user.id : 'N/A')
    }
  } catch (err) {
    console.error('Error de red/inesperado:', err)
  }
}

runTest()
