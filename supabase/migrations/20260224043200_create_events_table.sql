
  create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text default ''::text,
    "end_time" time without time zone,
    "location" text not null,
    "dress_code" text default ''::text,
    "menu" text[] not null default '{}'::text[],
    "additional_details" text default ''::text,
    "category" text not null default 'other'::text,
    "priority" text not null default 'medium'::text,
    "organizer" text not null default ''::text,
    "status" text not null default 'draft'::text,
    "max_attendees" integer,
    "tags" text[] not null default '{}'::text[],
    "notes" text,
    "side" text not null default 'both'::text,
    "event_date" date not null,
    "start_time" time without time zone not null,
    "registration_required" boolean not null default false,
    "attendees" jsonb not null default '[]'::jsonb,
    "reminders" jsonb not null default '[]'::jsonb,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
      );


alter table "public"."events" enable row level security;

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE INDEX idx_events_event_date ON public.events USING btree (event_date);

CREATE INDEX idx_events_status ON public.events USING btree (status);

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."events" add constraint "events_category_check" CHECK ((category = ANY (ARRAY['milestone'::text, 'meeting'::text, 'celebration'::text, 'deadline'::text, 'workshop'::text, 'other'::text]))) not valid;

alter table "public"."events" validate constraint "events_category_check";

alter table "public"."events" add constraint "events_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))) not valid;

alter table "public"."events" validate constraint "events_priority_check";

alter table "public"."events" add constraint "events_side_check" CHECK ((side = ANY (ARRAY['both'::text, 'bride'::text, 'groom'::text]))) not valid;

alter table "public"."events" validate constraint "events_side_check";

alter table "public"."events" add constraint "events_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'cancelled'::text, 'completed'::text]))) not valid;

alter table "public"."events" validate constraint "events_status_check";

set check_function_bodies = off;

create or replace view "public"."events_api" as  SELECT id,
    title,
    description,
    end_time,
    end_time AS "endTime",
    location,
    dress_code,
    dress_code AS "dressCode",
    menu,
    additional_details,
    additional_details AS "additionalDetails",
    category,
    priority,
    organizer,
    status,
    max_attendees,
    max_attendees AS "maxAttendees",
    tags,
    notes,
    side,
    event_date AS "eventDate",
    start_time AS "startTime",
    registration_required AS "registrationRequired",
    created_at AS "createdAt",
    updated_at AS "updatedAt",
    attendees,
    reminders
   FROM public.events;


CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";


  create policy "events_delete_authenticated"
  on "public"."events"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "events_insert_authenticated"
  on "public"."events"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "events_select_authenticated"
  on "public"."events"
  as permissive
  for select
  to authenticated
using (true);



  create policy "events_update_authenticated"
  on "public"."events"
  as permissive
  for update
  to authenticated
using (true)
with check (true);


CREATE TRIGGER trg_events_set_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


