"use client"                                                                                                                         
   import { useEffect, useState } from "react"                                                                                          
   import { supabase } from "@/lib/supabase"                                                                                            
   import Link from "next/link"                                                                                                         
   import { Plus, Trash2, RefreshCw, ExternalLink, LogOut } from "lucide-react"                                                         
   import { useRouter } from "next/navigation"                                                                                          
                                                                                                                                        
   export default function CompetitorsPage() {                                                                                          
     const [competitors, setCompetitors] = useState<any[]>([])                                                                          
     const [name, setName] = useState("")                                                                                               
     const [url, setUrl] = useState("")                                                                                                 
     const [loading, setLoading] = useState(true)                                                                                       
     const [adding, setAdding] = useState(false)                                                                                        
     const [scanning, setScanning] = useState<string | null>(null)                                                                      
     const router = useRouter()                                                                                                         
                                                                                                                                        
     useEffect(() => { load() }, [])                                                                                                    
                                                                                                                                        
     async function load() {                                                                                                            
       const { data: { user } } = await supabase.auth.getUser()                                                                         
       if (!user) { router.push("/login"); return }                                                                                     
       const { data } = await supabase.from("competitors").sel ect("*").order("created_at", { ascending: false })                       
       setCompetitors(data || [])                                                                                                       
       setLoading(false)                                                                                                                
     }                                                                                                                                  
                                                                                                                                        
     async function add(e: React.FormEvent) {                                                                                           
       e.preventDefault()                                                                                                               
       setAdding(true)                                                                                                                  
       const { data: { user } } = await supabase.auth.getUser()                                                                         
       if (!user) return                                                                                                                
       await supabase.from("competitors").ins ert({                                                                                     
         user_id: user.id, name,                                                                                                        
         url: url.startsWith("http") ? url : "https://" + url,                                                                          
         status: "active",                                                                                                              
       })                                                                                                                               
       setName(""); setUrl("")                                                                                                          
       load()                                                                                                                           
       setAdding(false)                                                                                                                 
     }                                                                                                                                  
                                                                                                                                        
     async function del(id: string) {                                                                                                   
       await supabase.from("competitors").del ete().eq("id", id)                                                                        
       setCompetitors(p => p.filter(c => c.id !== id))                                                                                  
     }                                                                                                                                  
                                                                                                                                        
     async function scan(id: string) {                                                                                                  
       setScanning(id)                                                                                                                  
       await fetch("/api/monitor/run", {                                                                                                
         method: "POST",                                                                                                                
         headers: { "Content-Type": "application/json" },                                                                               
         body: JSON.stringify({ competitorId: id }),                                                                                    
       })                                                                                                                               
       setScanning(null)                                                                                                                
       load()                                                                                                                           
     }                                                                                                                                  
                                                                                                                                        
     return (                                                                                                                           
       <div className="min-h-screen bg-gray-950 text-white">                                                                            
         <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">                       
           <Link href="/dashboard" className="text-xl font-bold text-teal-400">ZaxScape</Link>                                          
           <div className="flex gap-4 items-center">                                                                                    
             <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link>                                
             <button onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}                                     
               className="text-gray-500 hover:text-white"><LogOut className="w-4 h-4" /></button>                                       
           </div>                                                                                                                       
         </nav>                                                                                                                         
         <main className="max-w-4xl mx-auto px-6 py-10">                                                                                
           <h1 className="text-2xl font-bold mb-8">Competitors</h1>                                                                     
           <form onSubmit={add} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">                                     
             <h2 className="font-semibold mb-4 flex items-center gap-2">                                                                
               <Plus className="w-4 h-4 text-teal-400" />Add Competitor                                                                 
             </h2>                                                                                                                      
             <div className="grid sm:grid-cols-2 gap-4 mb-4">                                                                           
               <div>                                                                                                                    
                 <label className="block text-sm text-gray-400 mb-1.5">Company name</label>                                             
                 <input value={name} onChange={e => setName(e.target.value)} required placeholder="Acme Inc"                            
                   className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500          
 focus:outline-none focus:border-teal-500" />                                                                                           
               </div>                                                                                                                   
               <div>                                                                                                                    
                 <label className="block text-sm text-gray-400 mb-1.5">URL to monitor</label>                                           
                 <input value={url} onChange={e => setUrl(e.target.value)} required placeholder="acme.com/pricing"                      
                   className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500          
 focus:outline-none focus:border-teal-500" />                                                                                           
               </div>                                                                                                                   
             </div>                                                                                                                     
             <button type="submit" disabled={adding}                                                                                    
               className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium">     
               {adding ? "Adding..." : "Add competitor"}                                                                                
             </button>                                                                                                                  
           </form>                                                                                                                      
           {loading ? <div className="text-gray-500 text-center py-10">Loading...</div>                                                 
             : competitors.length === 0 ? <div className="text-gray-500 text-center py-16">No competitors yet.</div>                    
             : <div className="space-y-3">{competito rs.map(c => (                                                                      
                 <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between gap-4"> 
                   <div className="min-w-0">                                                                                            
                     <div className="flex items-center gap-2 mb-1">                                                                     
                       <span className="font-medium">{c.name}</span>                                                                    
                       <span className={"text-xs px-2 py-0.5 rounded-full " + (c.status === "active" ? "bg-teal-500/10 text-teal-400" : 
  "bg-gray-700 text-gray-400")}>{c.status}</span>                                                                                       
                     </div>                                                                                                             
                     <a href={c.url} target="_blank" rel="noopener noreferrer"                                                          
                       className="flex items-center gap-1 text-sm text-gray-500 hover:text-teal-400 truncate max-w-xs">                 
                       {c.url}<ExternalLink className="w-3 h-3" />                                                                      
                     </a>                                                                                                               
                   </div>                                                                                                               
                   <div className="flex items-center gap-2">                                                                            
                     <button onClick={() => scan(c.id)} disabled={scanning === c.id}                                                    
                       className="text-gray-400 hover:text-teal-400 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50">              
                       <RefreshCw className={"w-4 h-4" + (scanning === c.id ? " animate-spin" : "")} />                                 
                     </button>                                                                                                          
                     <button onClick={() => del(c.id)}                                                                                  
                       className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-800">                                   
                       <Trash2 className="w-4 h-4" />                                                                                   
                     </button>                                                                                                          
                   </div>                                                                                                               
                 </div>                                                                                                                 
               ))}</div>                                                                                                                
           }                                                                                                                            
         </main>                                                                                                                        
       </div>                                                                                                                           
     )                                                                                                                                  
   }
