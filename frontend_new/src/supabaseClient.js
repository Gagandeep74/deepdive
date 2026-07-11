import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kjxpgfvmcixrkzvotwsz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__wxLWxe877d6EH6SlADzeQ_2sQpgjhc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
