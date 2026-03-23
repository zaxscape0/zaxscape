import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
export async function POST(req: NextRequest) {
  try {
    const { overage_id, claimant_name, claimant_email, claimant_phone, message } = await req.json()
    if (!overage_id || !claimant_name || !claimant_email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const db = createServerSupabase()
    const { data: ov } = await db.from('overages').select('*').eq('id', overage_id).single()
    if (!ov) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { error } = await db.from('surplus_claims').insert({ overage_id, claimant_name, claimant_email, claimant_phone: claimant_phone||null, message: message||null, status: 'new' })
    if (error) throw error
    const sf = ov.surplus_amount >= 1000000 ? '$'+(ov.surplus_amount/1000000).toFixed(2)+'M' : '$'+Math.round(ov.surplus_amount/1000)+'k'
    const app = process.env.NEXT_PUBLIC_APP_URL || 'https://app.zaxscape.com'
    const send = (to: string[], subj: string, html: string) => fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer '+process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'ZaxScape <info@zaxscape.com>', to, subject: subj, html }) })
    await send(['info@zaxscape.com'], 'New surplus claim: '+sf+' — '+claimant_name, '<h2>New Surplus Claim</h2><p><b>'+claimant_name+'</b><br/>'+claimant_email+'<br/>'+(claimant_phone||'no phone')+'</p><p>'+ov.property_address+', '+(ov.city||'')+' '+ov.state+' — '+sf+'</p><p>'+ov.county+' County · '+(ov.case_number||'N/A')+'</p>'+(message?'<p><i>'+message+'</i></p>':'')+'<p><a href="'+app+'/admin/surplus">View Admin</a></p>')
    await send([claimant_email], 'We received your claim — '+sf+' in '+ov.county+' County', '<p>Hi '+claimant_name+',</p><p>We received your claim for <b>'+sf+'</b> from the tax deed sale of '+ov.property_address+', '+(ov.city||'')+' '+ov.state+'.</p><p>Our team will review and reach out within 24 hours. No upfront cost — our fee is 30% of recovered funds.</p><p>— ZaxScape Team</p>')
    return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e?.message||'Error' }, { status: 500 }) }
}
