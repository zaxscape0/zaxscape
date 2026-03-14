import Stripe from 'stripe'                                                                                                          
                                                                                                                                        
   export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {                                                         
     apiVersion: '2026-02-25.clover',                                                                                                   
   })                                                                                                                                   
                                                                                                                                        
   export const PLANS: Record<string, { name: string; price: number; priceId: string; competitorLimit: number }> = {                    
     starter: { name: 'Starter', price: 99, priceId: process.env.STRIPE_PRICE_STARTER as string, competitorLimit: 3 },                  
     pro: { name: 'Pro', price: 199, priceId: process.env.STRIPE_PRICE_PRO as string, competitorLimit: 10 },                            
     team: { name: 'Team', price: 399, priceId: process.env.STRIPE_PRICE_TEAM as string, competitorLimit: 999 },                        
   }
