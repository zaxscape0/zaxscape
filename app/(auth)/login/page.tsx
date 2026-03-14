"use client"                                                                                                                         
   import { useState } from "react"                                                                                                     
   import Link from "next/link"                                                                                                         
   import { supabase } from "@/lib/supabase"                                                                                            
   import { useRouter } from "next/navigation"                                                                                          
                                                                                                                                        
   export default function LoginPage() {                                                                                                
     const [email, setEmail] = useState("")                                                                                             
     const [password, setPassword] = useState("")                                                                                       
     const [error, setError] = useState("")                                                                                             
     const [loading, setLoading] = useState(false)                                                                                      
     const router = useRouter()                                                                                                         
                                                                                                                                        
     async function handleLogin(e: React.FormEvent) {                                                                                   
       e.preventDefault()                                                                                                               
       setLoading(true)                                                                                                                 
       setError("")                                                                                                                     
       const { error } = await supabase.auth.signInWithPassword({ email, password })                                                   
       if (error) { setError(error.message); setLoading(false) }                                                                        
       else { router.push("/dashboard") }                                                                                               
     }                                                                                                                                  
                                                                                                                                        
     return (                                                                                                                           
       <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">                                                 
         <div className="w-full max-w-sm">                                                                                              
           <div className="text-center mb-8">                                                                                           
             <Link href="/" className="text-2xl font-bold text-teal-400">ZaxScape</Link>                                                
             <p className="text-gray-400 mt-2">Sign in to your account</p>                                                              
           </div>                                                                                                                       
           <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-4">                        
             {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">{error}</div>}       
             <div>                                                                                                                      
               <label className="block text-sm text-gray-400 mb-1.5">Email</label>                                                      
               <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com"        
                 className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500            
 focus:outline-none focus:border-teal-500 transition" />                                                                                
             </div>                                                                                                                     
             <div>                                                                                                                      
               <label className="block text-sm text-gray-400 mb-1.5">Password</label>                                                   
               <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"      
                 className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500            
 focus:outline-none focus:border-teal-500 transition" />                                                                                
             </div>                                                                                                                     
             <button type="submit" disabled={loading}                                                                                   
               className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium             
 transition">                                                                                                                           
               {loading ? "Signing in..." : "Sign in"}                                                                                  
             </button>                                                                                                                  
             <p className="text-center text-sm text-gray-500">                                                                          
               No account? <Link href="/signup" className="text-teal-400 hover:underline">Sign up</Link>                                
             </p>                                                                                                                       
           </form>                                                                                                                      
         </div>                                                                                                                         
       </div>                                                                                                                           
     )                                                                                                                                  
   }
