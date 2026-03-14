import { NextRequest, NextResponse } from 'next/server'                                                                              
   import { stripe } from '@/lib/stripe'                                                                                                
   import { createServerSupabase } from '@/lib/supabase'                                                                                
                                                                                                                                        
   export async function POST(req: NextRequest) {                                                                                       
     const body = await req.text()                                                                                                      
     const sig = req.headers.get('stripe-signature') || ''                                                                             
                                                                                                                                        
     let event: any                                                                                                                     
     try {                                                                                                                              
       event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')                                      
     } catch {                                                                                                                          
       return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })                                                        
     }                                                                                                                                  
                                                                                                                                        
     const db = createServerSupabase()                                                                                                  
                                                                                                                                        
     if (event.type === 'checkout.session.completed') {                                                                                 
       const s = event.data.object                                                                                                      
       const plan = s.metadata?.plan || 'starter'                                                                                       
       const limits: Record<string, number> = { starter: 3, pro: 10, team: 999 }                                                        
       if (s.customer_email) {                                                                                                          
         await db.from('profiles').update({                                                                                             
           plan,                                                                                                                        
           stripe_customer_id: s.customer,                                                                                              
           stripe_subscription_id: s.subscription,                                                                                      
           competitor_limit: limits[plan] || 3,                                                                                         
         }).eq('email', s.customer_email)                                                                                               
       }                                                                                                                                
     }                                                                                                                                  
                                                                                                                                        
     if (event.type === 'customer.subscription.deleted') {                                                                              
       const s = event.data.object                                                                                                      
       await db.from('profiles').update({ plan: 'free', competitor_limit: 0 }).eq('stripe_subscription_id', s.id)                       
     }                                                                                                                                  
                                                                                                                                        
     return NextResponse.json({ received: true })                                                                                       
   }
