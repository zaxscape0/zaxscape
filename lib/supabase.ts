   import { createClient } from '@supabase/supabase-js'                                                                 
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE _URL!                                                           
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE _ANON_KEY!                                                  
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)                                                   
   export function createServerSupabase() {                                                                             
     return createClient(process.env.NEXT_PU BLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROL E_KEY!)               
   }                                                                                                                    
   ENDOFFILE                                                                                                            
   echo "✓ lib/supabase.ts"
ENDOFILE
