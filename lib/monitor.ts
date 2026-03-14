import { createServerSupabase } from './supabase'                                                                                    
   import OpenAI from 'openai'                                                                                                          
                                                                                                                                        
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })                                                          
                                                                                                                                        
   export async function scrapeUrl(url: string): Promise<string> {                                                                      
     const r = await fetch(url, {                                                                                                       
       headers: { 'User-Agent': 'ZaxScapeBot/1.0' },                                                                                    
       signal: AbortSignal.timeout(15000),                                                                                              
     })                                                                                                                                 
     const html = await r.text()                                                                                                        
     return html                                                                                                                        
       .replace(/<script[\s\S]*?<\/script>/gi, '')                                                                                      
       .replace(/<style[\s\S]*?<\/style>/gi, '')                                                                                        
       .replace(/<[^>]+>/g, ' ')                                                                                                        
       .replace(/\s+/g, ' ')                                                                                                            
       .trim()                                                                                                                          
       .slice(0, 10000)                                                                                                                 
   }                                                                                                                                    
                                                                                                                                        
   export function hashContent(c: string): string {                                                                                     
     let h = 0                                                                                                                          
     for (let i = 0; i < c.length; i++) h = ((h << 5) - h + c.charCodeAt(i)) & 0xffffffff                                               
     return h.toString(16)                                                                                                              
   }                                                                                                                                    
                                                                                                                                        
   export async function analyzeChanges(prev: string, curr: string, name: string): Promise<string> {                                    
     const r = await openai.chat.completions.create({                                                                                   
       model: 'gpt-4o-mini',                                                                                                            
       messages: [                                                                                                                      
         { role: 'system', content: 'You are a competitive intelligence analyst. Summarize competitor page changes concisely and actionably.' },                                                                                                                        
         { role: 'user', content: `Competitor: ${name}\nPREVIOUS:\n${prev.slice(0, 3000)}\nCURRENT:\n${curr.slice(0, 3000)}\nWhat       
 changed and why does it matter?` },                                                                                                    
       ],                                                                                                                               
       max_tokens: 500,                                                                                                                 
     })                                                                                                                                 
     return r.choices[0].message.content || 'No significant changes.'                                                                   
   }                                                                                                                                    
                                                                                                                                        
   export async function runMonitorForCompetitor(competit orId: string) {                                                               
     const db = createServerSupabase()                                                                                                  
     const { data: competitor } = await db.from('competitors').select('* ').eq('id', competitorId).single()                             
     if (!competitor) throw new Error('Competitor not found')                                                                           
                                                                                                                                        
     const currentContent = await scrapeUrl(competitor.url)                                                                             
     const currentHash = hashContent(currentContent)                                                                                    
                                                                                                                                        
     const { data: last } = await db                                                                                                    
       .from('snapshots')                                                                                                               
       .select('*')                                                                                                                     
       .eq('competitor_id', competitorId)                                                                                               
       .order('scanned_at', { ascending: false })                                                                                       
       .limit(1)                                                                                                                        
       .single()                                                                                                                        
                                                                                                                                        
     let changesDetected = null                                                                                                         
     const hasChanged = !last || last.content_hash !== currentHash                                                                      
                                                                                                                                        
     if (hasChanged && last) {                                                                                                          
       const summary = await analyzeChanges(last.content || '', currentContent, competitor.name)                                        
       changesDetected = { summary, detected_at: new Date().toISOString() }                                                             
     }                                                                                                                                  
                                                                                                                                        
     await db.from('snapshots').insert({                                                                                                
       competitor_id: competitorId,                                                                                                     
       content_hash: currentHash,                                                                                                       
       content: currentContent,                                                                                                         
       changes_detected: changesDetected,                                                                                               
     })                                                                                                                                 
                                                                                                                                        
     await db.from('competitors').update({ last_scanned_at: new Date().toISOString() }).eq('id', competitorId)                          
                                                                                                                                        
     return { hasChanged, changesDetected }                                                                                             
   } 
