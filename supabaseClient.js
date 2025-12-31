import { createClient } from '@supabase/supabase-js'

// En Vite se usa import.meta.env para acceder a las variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validamos que las variables existan para evitar errores difíciles de rastrear
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan las variables de entorno de Supabase. Verifica tu archivo .env")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
})

// Función para obtener el ID del usuario actual
export const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error obteniendo usuario actual:', error)
    return null
  }

  return user?.id || null
}

// Función para obtener el usuario actual completo
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error obteniendo usuario actual:', error)
    return null
  }

  return user
}
