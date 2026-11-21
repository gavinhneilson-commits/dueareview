-- Due A Review: full database setup. Paste ALL of this into Supabase → SQL Editor → New query → Run. Run it once only.

-- ════════════════════════════════════════════════════════════════════════
-- Due A Review — initial schema
-- Security model:
--   * The public (anon) role can only SELECT content that is published and
--     whose publish time has passed. Drafts are invisible at the DATABASE level,
--     not just hidden in the UI.
--   * Staff roles live in public.profiles. A new auth user gets NO role and
--     therefore no access until an admin grants one.
--   * The app never uses the service-role key.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────
create type public.staff_role as enum ('admin', 'editor', 'contributor');
create type public.content_status as enum ('draft', 'scheduled', 'published', 'unpublished');
create type public.obtained_method as enum ('purchased', 'loaned', 'gifted', 'sponsored', 'other');
create type public.review_collection as enum ('good', 'bad', 'ugly');
create type public.comparison_kind as enum ('versus', 'best_under', 'budget_vs_premium', 'guide');
create type public.video_kind as enum ('video', 'short', 'instagram');
create type public.submission_kind as enum ('contact', 'review_request', 'reader_question', 'brand_response', 'correction');

-- ── Profiles & roles ─────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  role public.staff_role,             -- NULL = no access
  created_at timestamptz not null default now()
);

create or replace function public.current_role_name()
returns public.staff_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((select role is not null from public.profiles where id = auth.uid()), false) $$;

create or replace function public.is_editor()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((select role in ('admin','editor') from public.profiles where id = auth.uid()), false) $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false) $$;

-- Create a profile row (with no role) whenever a user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Users may not change their own role.
create or replace function public.guard_role_change()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  -- auth.uid() is null in the SQL editor / migrations, which are trusted contexts.
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end $$;

create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_role_change();

-- ── updated_at helper ────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ── Categories ───────────────────────────────────────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── Reviews ──────────────────────────────────────────────────────────────
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.content_status not null default 'draft',
  published_at timestamptz,            -- go-live time (also used for scheduling)
  reviewed_at date,                    -- when testing concluded
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,

  title text not null check (char_length(title) between 3 and 160),
  product_name text not null,
  brand text,
  model text,
  category_id uuid references public.categories (id) on delete set null,

  hero_image_url text,
  hero_image_alt text,
  gallery jsonb not null default '[]'::jsonb,      -- [{url, alt}]

  price_pence int check (price_pence >= 0),
  price_note text,                                  -- e.g. "Price paid, Jan 2026"
  obtained_method public.obtained_method,
  obtained_note text,
  testing_duration text,                            -- free text, only what actually happened
  testing_notes text,

  video_url text,
  short_verdict text check (char_length(short_verdict) <= 240),
  verdict_label text check (char_length(verdict_label) <= 40),
  body text not null default '',                    -- Markdown
  pros text[] not null default '{}',
  cons text[] not null default '{}',

  overall_rating numeric(3,1) check (overall_rating between 0 and 10),
  performance_rating numeric(3,1) check (performance_rating between 0 and 10),
  value_rating numeric(3,1) check (value_rating between 0 and 10),
  build_rating numeric(3,1) check (build_rating between 0 and 10),
  rating_approved boolean not null default false,   -- must be ticked by a human

  specs jsonb not null default '[]'::jsonb,         -- [{label, value}]
  final_verdict text,
  retailer_links jsonb not null default '[]'::jsonb, -- [{name, url, affiliate}]
  has_affiliate_links boolean not null default false,
  is_sponsored boolean not null default false,
  sponsor_disclosure text,

  collection public.review_collection,
  worth_your_money boolean not null default false,
  featured boolean not null default false,

  seo_title text,
  seo_description text,
  og_image_url text,

  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(product_name,'') || ' ' || coalesce(brand,'') || ' ' || coalesce(model,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(short_verdict,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(body,'')), 'C')
  ) stored,

  -- A review can only go live with a human-approved rating and a publish time.
  constraint publish_requires_approved_rating check (
    status not in ('published','scheduled')
    or (overall_rating is not null and rating_approved and published_at is not null)
  ),
  constraint sponsored_requires_disclosure check (
    not is_sponsored or coalesce(char_length(sponsor_disclosure),0) > 0
  )
);

create index reviews_public_idx on public.reviews (status, published_at desc);
create index reviews_category_idx on public.reviews (category_id);
create index reviews_brand_idx on public.reviews (lower(brand));
create index reviews_search_idx on public.reviews using gin (search);
create trigger reviews_touch before update on public.reviews
  for each row execute function public.touch_updated_at();

-- Contributors may never publish; enforced in the database.
create or replace function public.guard_review_publish()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.status in ('published','scheduled')
     and (tg_op = 'INSERT' or old.status is distinct from new.status or old.published_at is distinct from new.published_at)
     and auth.uid() is not null and not public.is_editor() then
    raise exception 'Only editors or admins can publish or schedule';
  end if;
  if new.rating_approved and (tg_op = 'INSERT' or not old.rating_approved)
     and auth.uid() is not null and not public.is_editor() then
    raise exception 'Only editors or admins can approve ratings';
  end if;
  return new;
end $$;

create trigger reviews_guard_publish before insert or update on public.reviews
  for each row execute function public.guard_review_publish();

-- Public update history / corrections log
create table public.review_updates (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  note text not null check (char_length(note) between 3 and 1000),
  is_correction boolean not null default false,
  created_at timestamptz not null default now()
);
create index review_updates_review_idx on public.review_updates (review_id, created_at desc);

-- ── Comparisons ──────────────────────────────────────────────────────────
create table public.comparisons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind public.comparison_kind not null default 'versus',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  title text not null,
  intro text,
  body text not null default '',
  recommendation text,
  hero_image_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comparison_publish_time check (status not in ('published','scheduled') or published_at is not null)
);
create trigger comparisons_touch before update on public.comparisons
  for each row execute function public.touch_updated_at();

create table public.comparison_items (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons (id) on delete cascade,
  review_id uuid references public.reviews (id) on delete set null,
  position int not null default 0,
  product_name text not null,
  price_pence int check (price_pence >= 0),
  rating numeric(3,1) check (rating between 0 and 10),
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  specs jsonb not null default '[]'::jsonb,
  observations text,     -- only observations from actual testing
  best_for text,
  image_url text
);
create index comparison_items_cmp_idx on public.comparison_items (comparison_id, position);

-- ── Videos ───────────────────────────────────────────────────────────────
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  kind public.video_kind not null default 'video',
  title text not null,
  url text not null,                   -- YouTube / Shorts / Instagram URL as pasted
  youtube_id text check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  review_id uuid references public.reviews (id) on delete set null,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index videos_public_idx on public.videos (status, published_at desc);

-- ── Site settings (key/value) ────────────────────────────────────────────
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ── Reader submissions ───────────────────────────────────────────────────
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  kind public.submission_kind not null,
  name text check (char_length(name) <= 120),
  email text check (char_length(email) <= 254),
  subject text check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 5 and 5000),
  related_url text check (char_length(related_url) <= 500),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.reviews enable row level security;
alter table public.review_updates enable row level security;
alter table public.comparisons enable row level security;
alter table public.comparison_items enable row level security;
alter table public.videos enable row level security;
alter table public.site_settings enable row level security;
alter table public.submissions enable row level security;

-- Visibility rule used everywhere: live = published/scheduled AND time has passed.
create or replace function public.is_live(s public.content_status, p timestamptz)
returns boolean language sql stable
as $$ select s in ('published','scheduled') and p is not null and p <= now() $$;

-- profiles
create policy "profiles: self read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles: admin update" on public.profiles for update using (public.is_admin()) with check (public.is_admin());
create policy "profiles: self name" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- categories
create policy "categories: public read" on public.categories for select using (true);
create policy "categories: editors write" on public.categories for all using (public.is_editor()) with check (public.is_editor());

-- reviews
create policy "reviews: public read live" on public.reviews for select using (public.is_live(status, published_at));
create policy "reviews: staff read all" on public.reviews for select using (public.is_staff());
create policy "reviews: staff insert" on public.reviews for insert with check (public.is_staff());
create policy "reviews: editors update" on public.reviews for update using (public.is_editor()) with check (public.is_editor());
create policy "reviews: contributors update own drafts" on public.reviews for update
  using (public.is_staff() and created_by = auth.uid() and status = 'draft')
  with check (created_by = auth.uid() and status = 'draft');
create policy "reviews: admins delete" on public.reviews for delete using (public.is_admin());

-- review_updates
create policy "review_updates: public read for live reviews" on public.review_updates for select
  using (exists (select 1 from public.reviews r where r.id = review_id and public.is_live(r.status, r.published_at)));
create policy "review_updates: staff read" on public.review_updates for select using (public.is_staff());
create policy "review_updates: editors write" on public.review_updates for all using (public.is_editor()) with check (public.is_editor());

-- comparisons
create policy "comparisons: public read live" on public.comparisons for select using (public.is_live(status, published_at));
create policy "comparisons: staff read" on public.comparisons for select using (public.is_staff());
create policy "comparisons: editors write" on public.comparisons for all using (public.is_editor()) with check (public.is_editor());

create policy "comparison_items: public read live" on public.comparison_items for select
  using (exists (select 1 from public.comparisons c where c.id = comparison_id and public.is_live(c.status, c.published_at)));
create policy "comparison_items: staff read" on public.comparison_items for select using (public.is_staff());
create policy "comparison_items: editors write" on public.comparison_items for all using (public.is_editor()) with check (public.is_editor());

-- videos
create policy "videos: public read live" on public.videos for select using (public.is_live(status, published_at));
create policy "videos: staff read" on public.videos for select using (public.is_staff());
create policy "videos: editors write" on public.videos for all using (public.is_editor()) with check (public.is_editor());

-- site settings: public keys are readable; admins write
create policy "settings: public read" on public.site_settings for select using (true);
create policy "settings: admins write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- submissions: anyone may insert (never read); staff read/update
create policy "submissions: anyone insert" on public.submissions for insert with check (handled = false);
create policy "submissions: staff read" on public.submissions for select using (public.is_staff());
create policy "submissions: staff update" on public.submissions for update using (public.is_staff()) with check (public.is_staff());
create policy "submissions: admins delete" on public.submissions for delete using (public.is_admin());

-- ── Storage bucket for media ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif','image/gif'])
on conflict (id) do nothing;

create policy "media: public read" on storage.objects for select using (bucket_id = 'media');
create policy "media: staff upload" on storage.objects for insert with check (bucket_id = 'media' and public.is_staff());
create policy "media: editors update" on storage.objects for update using (bucket_id = 'media' and public.is_editor());
create policy "media: editors delete" on storage.objects for delete using (bucket_id = 'media' and public.is_editor());

-- Reference data only. No reviews are seeded: real reviews are written in the admin.
insert into public.categories (slug, name, description, sort_order) values
  ('technology-gadgets', 'Technology & Gadgets', 'Phones, audio, smart home and anything with a charging cable.', 10),
  ('home-kitchen',       'Home & Kitchen',       'Appliances, cookware and the stuff that lives on your worktop.', 20),
  ('fitness-sports',     'Fitness & Sports',     'Kit that promises to make you fitter. We check whether it does.', 30),
  ('tools-diy',          'Tools & DIY',          'Drills, gadgets and garage gear.', 40),
  ('cars-accessories',   'Cars & Accessories',   'Dash cams, chargers, cleaning kit and car tech.', 50),
  ('health-lifestyle',   'Health & Lifestyle',   'Everyday products for looking after yourself. Not medical advice.', 60),
  ('outdoor-travel',     'Outdoor & Travel',     'Bags, camping kit and travel gear.', 70),
  ('budget-finds',       'Budget Finds',         'Cheap stuff that is actually good. Rare, but it happens.', 80),
  ('premium-products',   'Premium Products',     'Expensive stuff. Is it worth it? Let''s find out.', 90),
  ('weird-wonderful',    'Weird & Wonderful',    'Gadgets nobody asked for. We tested them anyway.', 100)
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
  ('social', '{"youtube":"https://www.youtube.com/@dueareview","instagram":"https://www.instagram.com/dueareview","tiktok":"https://www.tiktok.com/@dueareview","x":"","facebook":"","threads":""}'::jsonb),
  ('homepage', '{"hero_review_id":null,"featured_review_ids":[]}'::jsonb),
  ('disclosures', '{"affiliate_short":"Some links on this page are affiliate links. If you buy through them we may earn a small commission, at no extra cost to you. It never affects our scores.","sponsored_short":"This content is sponsored. The sponsor had no control over our verdict or score."}'::jsonb),
  ('contact', '{"email":""}'::jsonb)
on conflict (key) do nothing;
