grant update (email) on table "public"."guest_families" to "anon";

create policy "Anon can update guest family email"
  on "public"."guest_families"
  as permissive
  for update
  to anon
  using (true)
  with check (true);

create or replace function public.append_family_email(family_row_id int, new_email text)
returns void
language plpgsql
security definer
as $$
begin
  update public.guest_families
  set email = array_append(email, new_email)
  where id = family_row_id
    and not (email @> array[new_email]);
end;
$$;

grant execute on function public.append_family_email(int, text) to anon;
grant execute on function public.append_family_email(int, text) to authenticated;
