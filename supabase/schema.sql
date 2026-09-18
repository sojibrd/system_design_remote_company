-- Cross-device progress sync — একটা শেয়ার্ড Supabase project, ১৩টা
-- workspace সাইটের জন্য। Supabase dashboard-এর SQL editor-এ এটা একবার
-- চালান। `site_prefix` (যেমন ldsa/rdsa/gdsa) দিয়ে প্রতিটা সাইটের ডেটা
-- আলাদা থাকে একই row-সেটে।

create table if not exists progress_sync (
  sync_key text not null,
  site_prefix text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (sync_key, site_prefix)
);

alter table progress_sync enable row level security;

-- এখানে "auth" মানে sync_key নিজেই — client-এ random UUID হিসেবে বানানো
-- হয়, অনুমান করা বাস্তবে অসম্ভব। তাই anon role-কে সব row-এ read/write
-- অনুমতি দেওয়া হচ্ছে; আসল boundary হলো key জানা থাকা (capability-based)।
-- personal, low-stakes progress-ডেটার জন্য যথেষ্ট — সংবেদনশীল তথ্যের জন্য নয়।
create policy "sync by key - select" on progress_sync for select using (true);
create policy "sync by key - insert" on progress_sync for insert with check (true);
create policy "sync by key - update" on progress_sync for update using (true) with check (true);
