create table if not exists profiles (                                                                                                
     id uuid references auth.users on delete cascade,                                                                                   
     email text,                                                                                                                        
     stripe_customer_id text,                                                                                                           
     stripe_subscription_id text,                                                                                                       
     plan text default 'free',                                                                                                          
     competitor_limit int default 0,                                                                                                    
     created_at timestamp with time zone default now(),                                                                                 
     primary key (id)                                                                                                                   
   );                                                                                                                                   
                                                                                                                                        
   create table if not exists competitors (                                                                                             
     id uuid default gen_random_uuid() primary key,                                                                                     
     user_id uuid references profiles(id) on delete cascade,                                                                            
     name text not null,                                                                                                                
     url text not null,                                                                                                                 
     status text default 'active',                                                                                                      
     last_scanned_at timestamp with time zone,                                                                                          
     created_at timestamp with time zone default now()                                                                                  
   );                                                                                                                                   
                                                                                                                                        
   create table if not exists snapshots (                                                                                               
     id uuid default gen_random_uuid() primary key,                                                                                     
     competitor_id uuid references competitors(id) on delete cascade,                                                                   
     content_hash text,                                                                                                                 
     content text,                                                                                                                      
     changes_detected jsonb,                                                                                                            
     scanned_at timestamp with time zone default now()                                                                                  
   );                                                                                                                                   
                                                                                                                                        
   create or replace function public.handle_new_user()                                                                                  
   returns trigger as $$                                                                                                                
   begin                                                                                                                                
     insert into public.profiles (id, email) values (new.id, new.email);                                                                
     return new;                                                                                                                        
   end;                                                                                                                                 
   $$ language plpgsql security definer;                                                                                                
                                                                                                                                        
   drop trigger if exists on_auth_user_created on auth.users;                                                                           
   create trigger on_auth_user_created                                                                                                  
     after insert on auth.users                                                                                                         
     for each row execute procedure public.handle_new_user();                                                                           
                                                                                                                                        
   alter table profiles enable row level security;                                                                                      
   alter table competitors enable row level security;                                                                                   
   alter table snapshots enable row level security;                                                                                     
                                                                                                                                        
   create policy "Users own profile" on profiles for all using (auth.uid() = id);                                                       
   create policy "Users own competitors" on competitors for all using (auth.uid() = user_id);                                           
   create policy "Users view snapshots" on snapshots for select using (                                                                 
     competitor_id in (select id from competitors where user_id = auth.uid())                                                           
   );                                                                                                                                   
   create policy "Service inserts snapshots" on snapshots for insert with check (true);                                                 
   create policy "Service updates competitors" on competitors for update using (true);

-- Job postings table
create table if not exists job_postings (
  id uuid default gen_random_uuid() primary key,
  competitor_id uuid references competitors(id) on delete cascade,
  title text not null,
  department text,
  location text,
  url text,
  signal text, -- AI-generated strategic signal
  first_seen_at timestamp with time zone default now(),
  last_seen_at timestamp with time zone default now(),
  is_new boolean default true
);

-- Reviews table
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  competitor_id uuid references competitors(id) on delete cascade,
  source text not null, -- g2, capterra, trustpilot
  rating numeric,
  title text,
  body text,
  sentiment text, -- positive, negative, neutral
  pain_point text, -- AI extracted pain point
  reviewer_role text,
  published_at timestamp with time zone,
  fetched_at timestamp with time zone default now()
);

-- Battlecards table
create table if not exists battlecards (
  id uuid default gen_random_uuid() primary key,
  competitor_id uuid references competitors(id) on delete cascade,
  content jsonb, -- structured battlecard data
  generated_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table job_postings enable row level security;
alter table reviews enable row level security;
alter table battlecards enable row level security;

create policy "Users view job_postings" on job_postings for select using (
  competitor_id in (select id from competitors where user_id = auth.uid())
);
create policy "Service inserts job_postings" on job_postings for insert with check (true);
create policy "Service updates job_postings" on job_postings for update using (true);

create policy "Users view reviews" on reviews for select using (
  competitor_id in (select id from competitors where user_id = auth.uid())
);
create policy "Service inserts reviews" on reviews for insert with check (true);

create policy "Users view battlecards" on battlecards for select using (
  competitor_id in (select id from competitors where user_id = auth.uid())
);
create policy "Service upserts battlecards" on battlecards for all using (true);

-- Outreach contacts table (surplus fund recovery CRM)
create table if not exists outreach_contacts (
  id uuid default gen_random_uuid() primary key,
  overage_id uuid references overages(id) on delete cascade,
  owner_name text,
  surplus_amount numeric,
  county text,
  state text,
  property_address text,
  mailing_address text,
  phone text,
  email text,
  status text default 'new' check (status in ('new','contacted','responded','claimed','dead')),
  contact_method text check (contact_method in ('mail','phone','email','in_person',null)),
  notes text,
  letter_sent_at timestamptz,
  last_contact_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists outreach_status_idx on outreach_contacts(status);
create index if not exists outreach_overage_idx on outreach_contacts(overage_id);
alter table outreach_contacts enable row level security;
create policy "Service manages outreach" on outreach_contacts for all using (true);
