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
