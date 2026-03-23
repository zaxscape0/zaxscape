import { createServerSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { secret } = await req.json()
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const db = createServerSupabase()
  const { error } = await db.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS outreach_contacts (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        overage_id uuid REFERENCES overages(id) ON DELETE CASCADE,
        owner_name text,
        surplus_amount numeric,
        county text,
        state text,
        property_address text,
        mailing_address text,
        phone text,
        email text,
        status text DEFAULT 'new' CHECK (status IN ('new','contacted','responded','claimed','dead')),
        contact_method text,
        notes text,
        letter_sent_at timestamptz,
        last_contact_at timestamptz,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS outreach_status_idx ON outreach_contacts(status);
      CREATE INDEX IF NOT EXISTS outreach_overage_idx ON outreach_contacts(overage_id);
    `
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
