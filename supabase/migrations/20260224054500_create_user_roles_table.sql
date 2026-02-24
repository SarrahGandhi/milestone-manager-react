create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_roles_role_check check (role in ('user', 'admin'))
);

create index if not exists idx_user_roles_role on public.user_roles(role);

create or replace function public.set_updated_at_user_roles()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_roles_set_updated_at on public.user_roles;
create trigger trg_user_roles_set_updated_at
before update on public.user_roles
for each row
execute function public.set_updated_at_user_roles();

create or replace function public.is_admin(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = check_user_id
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

create or replace function public.handle_new_auth_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_set_role on auth.users;
create trigger on_auth_user_created_set_role
after insert on auth.users
for each row
execute function public.handle_new_auth_user_role();

insert into public.user_roles (user_id, role)
select id, 'user'
from auth.users
on conflict (user_id) do nothing;

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_own_or_admin" on public.user_roles;
create policy "user_roles_select_own_or_admin"
on public.user_roles
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
);

drop policy if exists "user_roles_insert_admin_only" on public.user_roles;
create policy "user_roles_insert_admin_only"
on public.user_roles
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "user_roles_update_admin_only" on public.user_roles;
create policy "user_roles_update_admin_only"
on public.user_roles
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "user_roles_delete_admin_only" on public.user_roles;
create policy "user_roles_delete_admin_only"
on public.user_roles
for delete
to authenticated
using (public.is_admin(auth.uid()));
