 import { NextRequest, NextResponse } from 'next/server'                                                                              
   import { runMonitorForCompetitor } from '@/lib/monitor'                                                                              
   import { sendChangeAlert } from '@/lib/email'                                                                                        
   import { createServerSupabase } from '@/lib/supabase'                                                                                
                                                                                                                                        
   export async function POST(req: NextRequest) {                                                                                       
     try {                                                                                                                              
       const { competitorId } = await req.json()                                                                                        
       if (!competitorId) return NextResponse.json({ error: 'Missing competitorId' }, { status: 400 })                                  
                                                                                                                                        
       const result = await runMonitorForCompetitor(competit orId)                                                                      
                                                                                                                                        
       if (result.hasChanged && result.changesDetected) {                                                                               
         const db = createServerSupabase()                                                                                              
         const { data: c } = await db                                                                                                   
           .from('competitors')                                                                                                         
           .select('*, profiles(email)')                                                                                                
           .eq('id', competitorId)                                                                                                      
           .single()                                                                                                                    
         if (c?.profiles?.email) {                                                                                                      
           await sendChangeAlert(c.profiles.email , c.name, result.changesDetected.summary, c.url)                                      
         }                                                                                                                              
       }                                                                                                                                
                                                                                                                                        
       return NextResponse.json({ success: true, ...result })                                                                           
     } catch (e) {                                                                                                                      
       return NextResponse.json({ error: String(e) }, { status: 500 })                                                                  
     }                                                                                                                                  
   }
