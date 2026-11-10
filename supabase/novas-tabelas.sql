-- COMO USAR: Supabase > "SQL Editor" > "New query" > cole TUDO isto > "Run".
-- Pode rodar mais de uma vez sem problema.

-- 1) Gastos / entradas recorrentes
alter table public.transactions
  add column if not exists recurrence text not null default 'none',
  add column if not exists recurrence_end date,
  add column if not exists last_run date,
  add column if not exists parent_id uuid references public.transactions(id) on delete set null;

-- 2) Metas com depósito automático
alter table public.goals
  add column if not exists recurrence text not null default 'none',
  add column if not exists recurring_amount numeric(12,2),
  add column if not exists recurrence_start date,
  add column if not exists last_run date;

-- 3) Valores sempre com 2 casas decimais
alter table public.transactions alter column amount type numeric(12,2);
alter table public.goals alter column target type numeric(12,2);
alter table public.goal_deposits alter column amount type numeric(12,2);

-- 4) Foto de perfil: pasta pública "avatars"; cada pessoa só mexe na própria foto
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars_leitura" on storage.objects;
drop policy if exists "avatars_enviar_propria" on storage.objects;
drop policy if exists "avatars_trocar_propria" on storage.objects;
drop policy if exists "avatars_apagar_propria" on storage.objects;

create policy "avatars_leitura" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_enviar_propria" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_trocar_propria" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_apagar_propria" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
