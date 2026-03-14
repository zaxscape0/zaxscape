import { NextRequest, NextResponse } from 'next/server'                                                                              
   import { stripe, PLANS } from '@/lib/stripe'                                                                                         
                                                                                                                                        
   export async function POST(req: NextRequest) {                                                                                       
     const { plan, email } = await req.json()                                                                                           
     if (!PLANS[plan]) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })                                             
                                                                                                                                        
     const session = await stripe.checkout.sessions.create( {                                                                           
       customer_email: email,                                                                                                           
       payment_method_types: ['card'],                                                                                                  
       line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],                                                                       
       mode: 'subscription',                                                                                                            
       success_url: (process.env.NEXT_PUBLIC_APP_URL as string) + '/dashboard?success=true',                                            
       cancel_url: (process.env.NEXT_PUBLIC_APP_URL as string) + '/signup?plan=' + plan,                                                
       metadata: { plan },                                                                                                              
     })                                                                                                                                 
                                                                                                                                        
     return NextResponse.json({ url: session.url })                                                                                     
   } 
