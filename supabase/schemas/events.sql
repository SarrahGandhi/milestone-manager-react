-- Events table for Supabase (source of truth uses snake_case).
-- The events_api view below exposes response keys that match the JSON shape used by the app.

create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  end_time time,
  location text not null,
  dress_code text default '',
  menu text[] not null default '{}',
  additional_details text default '',
  category text not null default 'other',
  priority text not null default 'medium',
  organizer text not null default '',
  status text not null default 'draft',
  max_attendees integer,
  tags text[] not null default '{}',
  notes text,
  side text not null default 'both',
  event_date date not null,
  start_time time not null,
  registration_required boolean not null default false,
  attendees jsonb not null default '[]'::jsonb,
  reminders jsonb not null default '[]'::jsonb,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint events_category_check check (category in ('milestone', 'meeting', 'celebration', 'deadline', 'workshop', 'other')),
  constraint events_priority_check check (priority in ('low', 'medium', 'high', 'urgent')),
  constraint events_status_check check (status in ('draft', 'published', 'cancelled', 'completed')),
  constraint events_side_check check (side in ('both', 'bride', 'groom'))
);

create index if not exists idx_events_event_date on public.events(event_date);
create index if not exists idx_events_status on public.events(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_events_set_updated_at on public.events;
create trigger trg_events_set_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

alter table public.events enable row level security;

drop policy if exists "events_select_authenticated" on public.events;
create policy "events_select_authenticated"
on public.events
for select
to authenticated
using (true);

drop policy if exists "events_insert_authenticated" on public.events;
create policy "events_insert_authenticated"
on public.events
for insert
to authenticated
with check (true);

drop policy if exists "events_update_authenticated" on public.events;
create policy "events_update_authenticated"
on public.events
for update
to authenticated
using (true)
with check (true);

drop policy if exists "events_delete_authenticated" on public.events;
create policy "events_delete_authenticated"
on public.events
for delete
to authenticated
using (true);

create or replace view public.events_api as
select
  id,
  title,
  description,
  end_time,
  end_time as "endTime",
  location,
  dress_code,
  dress_code as "dressCode",
  menu,
  additional_details,
  additional_details as "additionalDetails",
  category,
  priority,
  organizer,
  status,
  max_attendees,
  max_attendees as "maxAttendees",
  tags,
  notes,
  side,
  event_date as "eventDate",
  start_time as "startTime",
  registration_required as "registrationRequired",
  created_at as "createdAt",
  updated_at as "updatedAt",
  attendees,
  reminders
from public.events;
