import { Resend } from 'resend'                                                                                                      
                                                                                                                                        
   const resend = new Resend(process.env.RESEND_API_KEY as string)                                                                     
                                                                                                                                        
   export async function sendChangeAlert(to: string, name: string, summary: string, url: string) {                                      
     await resend.emails.send({                                                                                                         
       from: 'ZaxScape <info@zaxscape.com>',                                                                                            
       to,                                                                                                                              
       subject: 'Change detected: ' + name,                                                                                             
       html: `<div style="font-family:sans-serif;padding:24px">                                                                        
         <h1 style="color:#0d9488">Competitor Alert</h1>                                                                                
         <p><b>${name}</b> updated their page.</p>                                                                                      
         <p>${summary}</p>                                                                                                              
         <a href="${url}">View page</a>                                                                                                 
       </div>`,                                                                                                                         
     })                                                                                                                                 
   }                                                                                                                                    
                                                                                                                                        
   export async function sendWeeklyDigest(to: string, changes: { competitorName: string; summary: string; url: string }[]) {            
     const html = changes                                                                                                               
       .map(c => `<div style="margin-bottom:16px;padding:16px;border:1px solid #e5e7eb;border-radius:8px">                             
         <h3>${c.competitorName}</h3><p>${c.summary}</p>                                                                                
       </div>`)                                                                                                                         
       .join('')                                                                                                                        
     await resend.emails.send({                                                                                                         
       from: 'ZaxScape <info@zaxscape.com>',                                                                                            
       to,                                                                                                                              
       subject: 'Your Weekly Competitor Intelligence Digest',                                                                           
       html: `<div style="font-family:sans-serif;padding:24px">                                                                        
         <h1 style="color:#0d9488">Weekly Digest</h1>                                                                                   
         ${html || '<p>No changes this week.</p>'}                                                                                      
       </div>`,                                                                                                                         
     })                                                                                                                                 
   }
