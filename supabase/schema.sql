create table public.creators (
  id text primary key,
  handle text not null,
  display_name text not null,
  platforms text[] not null default '{}'
);

create table public.campaigns (
  id text primary key,
  name text not null,
  brand text not null,
  start_date date not null,
  end_date date,
  creator_id text not null references public.creators(id)
);

create table public.posts (
  id text primary key,
  platform text not null check (platform in ('instagram', 'ltk', 'amazon')),
  creator_id text not null references public.creators(id),
  campaign_id text references public.campaigns(id),
  external_id text,
  url text,
  posted_at timestamptz,
  title text,
  thumbnail_url text
);

create table public.post_metrics (
  id bigserial primary key,
  post_id text not null references public.posts(id),
  platform text not null check (platform in ('instagram', 'ltk', 'amazon')),
  date date not null,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  detail_page_views bigint not null default 0,
  add_to_carts bigint not null default 0,
  conversions bigint not null default 0,
  revenue numeric(18,2) not null default 0
);

create table public.link_mappings (
  id text primary key,
  creator_id text not null references public.creators(id),
  campaign_id text references public.campaigns(id),
  instagram_post_id text references public.posts(id),
  ltk_post_id text references public.posts(id),
  amazon_tracking_id text,
  amazon_asin text,
  last_updated timestamptz not null default now()
);

create index idx_post_metrics_post_id on public.post_metrics(post_id);
create index idx_post_metrics_date on public.post_metrics(date);
create index idx_campaigns_creator_id on public.campaigns(creator_id);
create index idx_link_mappings_creator on public.link_mappings(creator_id);
create index idx_link_mappings_campaign on public.link_mappings(campaign_id);
