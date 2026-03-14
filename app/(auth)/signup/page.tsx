"use client"                                                                                                                         
   import { useState, Suspense } from "react"                                                                                           
   import Link from "next/link"                                                                                                         
   import { supabase } from "@/lib/supabase"                                                                                            
   import { useRouter, useSearchParams } from "next/navigation"                                                                         
                                                                                                                                        
   function SignupForm() {                                                                                                              
     const [email, setEmail] = useState("")                                                                                             
     const [password, setPassword] = useState("")                                                                                       
     const [error, setError] = useState("")                                                                                             
     const [loading, setLoading] = useState(false)                                                                                      
     const [done, setDone] = useState(false)                                                                                            
     const router = useRouter()                                                                                                         
     const params = useSearchParams()                                                                                                   
     const plan = params.get("plan") || "starter"                                                                                       
                                                                                                                                        
     async function handleSignup(e: React.FormEvent) {                                                                                  
       e.preventDefault()                                                                                                               
       setLoading(true)                                                                                                                 
       setError("")                                                                                                                     
       const { data, error } = await supabase.auth.signUp({                                                                             
         email, password,                                                                                                               
         options: { emailRedirectTo: window.location.origin + "/dashboard" },                                                           
       })                                                                                                                               
       if (error) { setError(error.message); setLoading(false); return }                                                                
       if (data.user) {                                                                                                                 
         const res = await fetch("/api/checkout", {                                                                                     
           method: "POST",                                                                                                              
           headers: { "Content-Type": "application/json" },                                                                             
           body: JSON.stringify({ plan, email }),                                                                                       
         })                                                                                                                             
         const { url } = await res.json()                                                                                               
         if (url) window.location.href = url                                                                                            
         else setDone(true)                                                                                                             
       }                                                                                                                                
       setLoading(false)                                                                                                                
     }                                                                                                                                  
                                                                                                                                        
     if (done) return (                                                                                                                 
       <div className="text-center bg-gray-900 border border-gray-800 rounded-xl p-8">                                                  
         <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>                                                        
         <p className="text-gray-400">Confir mation sent to {email}</p>                                                                 
       </div>                                                                                                                           
     )                                                                                                                                  
                                                                                                                                        
     return (                                                                                                                           
       <form onSubmit={handleSignup} className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-4">                           
         {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">{error}</div>}           
         <div>                                                                                                                          
           <label className="block text-sm text-gray-400 mb-1.5">Email</label>                                                          
           <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com"            
             className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500                
 focus:outline-none focus:border-teal-500 transition" />                                                                                
         </div>                                                                                                                         
         <div>                                                                                                                          
           <label className="block text-sm text-gray-400 mb-1.5">Password</label>                                                       
           <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min  
 8 chars"                                                                                                                               
             className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500                
 focus:outline-none focus:border-teal-500 transition" />                                                                                
         </div>                                                                                                                         
         <p className="text-xs text-gray-500">Plan: <span className="text-teal-400 capitalize">{plan}</span></p>                        
         <button type="submit" disabled={loading}                                                                                       
           className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition">    
           {loading ? "Creating..." : "Create account"}                                                                                 
         </button>                                                                                                                      
         <p className="text-center text-sm text-gray-500">                                                                              
           Have an account? <Link href="/login" className="text-teal-400 hover:underline">Sign in</Link>                                
         </p>                                                                                                                           
       </form>                                                                                                                          
     )                                                                                                                                  
   }                                                                                                                                    
                                                                                                                                        
   export default function SignupPage() {                                                                                               
     return (                                                                                                                           
       <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">                                                 
         <div className="w-full max-w-sm">                                                                                              
           <div className="text-center mb-8">                                                                                           
             <Link href="/" className="text-2xl font-bold text-teal-400">ZaxScape</Link>                                                
             <p className="text-gray-400 mt-2">Start your free trial</p>                                                                
           </div>                                                                                                                       
           <Suspense fallback={<div className="text-gray-400 text-center">Loading...</div>}>                                            
             <SignupForm />                                                                                                             
           </Suspense>                                                                                                                  
         </div>                                                                                                                         
       </div>                                                                                                                           
     )                                                                                                                                  
   }
