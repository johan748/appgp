import { createClient } from '@supabase/supabase-js'

// En Vite se usa import.meta.env para acceder a las variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validamos que las variables existan para evitar errores difíciles de rastrear
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan las variables de entorno de Supabase. Verifica tu archivo .env")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)