"use client"                                                                                                                         
   import { useEffect, useState } from "react"                                                                                          
   import { supabase } from "@/lib/supabase"                                                                                            
   import Link from "next/link"                                                                                                         
   import { Plus, Bell, BarChart3, Clock, LogOut } from "lucide-react"                                                                  
   import { useRouter } from "next/navigation"                                                                                          
                                                                                                                                        
   export default function DashboardPage() {                                                                                            
     const [competitors, setCompetitors] = useState<any[]>([])                                                                          
     const [changes, setChanges] = useState<any[]>([])                                                                                  
     const [loading, setLoading] = useState(true)                                                                                       
     const router = useRouter()                                                                                                         
                                                                                                                                        
     useEffect(() => { load() }, [])                                                                                                    
                                                                                                                                        
     async function load() {                                                                                                            
       const { data: { user } } = await supabase.auth.getUser()                                                                         
       if (!user) { router.push("/login"); return }                                                                                     
       const { data: c } = await supabase.from("competitors").sel ect("*").order("created_at", { ascending: false })                    
       const { data: s } = await supabase.from("snapshots").selec t("*, competitors(name,url)")                                         
         .not("changes_detected", "is", null).order("scanned_at", { ascending: false }).limit(5)                                        
       setCompetitors(c || [])                                                                                                          
       setChanges(s || [])                                                                                                              
       setLoading(false)                                                                                                                
     }                                                                                                                                  
                                                                                                                                        
     if (loading) return (                                                                                                              
       <div className="min-h-screen bg-gray-950 flex items-center justify-center">                                                      
         <div className="text-teal-400 animate-pulse">Loading...</div>                                                                  
       </div>                                                                                                                           
     )                                                                                                                                  
                                                                                                                                        
     return (                                                                                                                           
       <div className="min-h-screen bg-gray-950 text-white">                                                                            
         <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">                       
           <span className="text-xl font-bold text-teal-400">ZaxScape</span>                                                            
           <div className="flex gap-4 items-center">                                                                                    
             <Link href="/competitors" className="text-gray-400 hover:text-white text-sm">Competitors</Link>                            
             <button onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}                                     
               className="text-gray-500 hover:text-white"><LogOut className="w-4 h-4" /></button>                                       
           </div>                                                                                                                       
         </nav>                                                                                                                         
         <main className="max-w-6xl mx-auto px-6 py-10">                                                                                
           <div className="flex items-center justify-between mb-8">                                                                     
             <h1 className="text-2xl font-bold">Dashboard</h1>                                                                          
             <Link href="/competitors" className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg 
 text-sm font-medium">                                                                                                                  
               <Plus className="w-4 h-4" />Add competitor                                                                               
             </Link>                                                                                                                    
           </div>                                                                                                                       
           <div className="grid grid-cols-3 gap-4 mb-10">                                                                               
             <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">                                                        
               <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-5 h-5 text-teal-400" /><span                       
 className="text-gray-400 text-sm">Monitored</span></div>                                                                               
               <div className="text-2xl font-bold">{competitors.filter(c => c.status === "active").length}</div>                        
             </div>                                                                                                                     
             <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">                                                        
               <div className="flex items-center gap-2 mb-2"><Bell className="w-5 h-5 text-teal-400" /><span className="text-gray-400   
 text-sm">Changes this week</span></div>                                                                                                
               <div className="text-2xl font-bold">{changes.length}</div>                                                               
             </div>                                                                                                                     
             <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">                                                        
               <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-teal-400" /><span className="text-gray-400  
 text-sm">Last scan</span></div>                                                                                                        
               <div className="text-2xl font-bold">{competitors[0]?.last _scanned_at ? new Date(competitors[0].last_scanned             
 _at).toLocaleDateString() : "Never"}</div>                                                                                             
             </div>                                                                                                                     
           </div>                                                                                                                       
           <h2 className="text-lg font-semibold mb-4">Recent Changes</h2>                                                               
           {changes.length === 0                                                                                                        
             ? <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center text-gray-500">No changes yet. Add        
 competitors to start monitoring.</div>                                                                                                 
             : <div className="space-y-3">{changes.m ap((s: any) => (                                                                   
                 <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">                                         
                   <div className="flex items-start justify-between mb-2">                                                              
                     <span className="font-medium">{s.competitors.name}</span>                                                          
                     <span className="text-gray-500 text-xs">{new Date(s.scanned_at).toLocaleDateString()}</span>                       
                   </div>                                                                                                               
                   <p className="text-gray-400 text-sm">{s.changes_detected?.summary}</p>                                               
                   <a href={s.competitors.url} target="_blank" rel="noopener noreferrer" className="text-teal-400 text-xs mt-2          
 inline-block hover:underline">View page</a>                                                                                            
                 </div>                                                                                                                 
               ))}</div>                                                                                                                
           }                                                                                                                            
         </main>                                                                                                                        
       </div>                                                                                                                           
     )                                                                                                                                  
   }
