import { NextRequest, NextResponse } from 'next/server'                                                                              
   import { createServerSupabase } from '@/lib/supabase'                                                                                
                                                                                                                                        
   export async function GET(req: NextRequest) {                                                                                        
     const db = createServerSupabase()                                                                                                  
     const userId = req.headers.get('x-user-id')                                                                                        
     if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })                                                  
     const { data, error } = await db.from('competitors').select('* ').eq('user_id', userId)                                            
     if (error) return NextResponse.json({ error: error.message }, { status: 500 })                                                     
     return NextResponse.json(data)                                                                                                     
   }                                                                                                                                    
                                                                                                                                        
   export async function POST(req: NextRequest) {                                                                                       
     const db = createServerSupabase()                                                                                                  
     const { name, url, user_id } = await req.json()                                                                                    
     if (!name || !url || !user_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })                              
     const { data, error } = await db                                                                                                   
       .from('competitors')                                                                                                             
       .insert({ name, url, user_id, status: 'active' })                                                                                
       .select()                                                                                                                        
       .single()                                                                                                                        
     if (error) return NextResponse.json({ error: error.message }, { status: 500 })                                                     
     return NextResponse.json(data)                                                                                                     
   }
