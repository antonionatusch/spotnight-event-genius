create table if not exists public.reservation_audit_events (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references public.reservations(id) on delete cascade,
  event_id text not null,
  reservation_code text not null,
  type text not null check (
    type in (
      'check_in_success',
      'check_in_duplicate',
      'check_in_cancelled',
      'check_in_expired',
      'check_in_invalid',
      'reservation_cancelled',
      'reservation_restored',
      'check_in_reverted',
      'spot_reassigned',
      'owner_note'
    )
  ),
  reason text,
  message text not null,
  actor_role text check (actor_role in ('user', 'owner', 'staff')),
  actor_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reservation_audit_events_reservation_id_idx
  on public.reservation_audit_events (reservation_id);

create index if not exists reservation_audit_events_event_id_idx
  on public.reservation_audit_events (event_id);

create index if not exists reservation_audit_events_reservation_code_idx
  on public.reservation_audit_events (reservation_code);

create index if not exists reservation_audit_events_type_idx
  on public.reservation_audit_events (type);

create index if not exists reservation_audit_events_created_at_idx
  on public.reservation_audit_events (created_at desc);

alter table public.reservation_audit_events enable row level security;

drop policy if exists "Read reservation audit events" on public.reservation_audit_events;
create policy "Read reservation audit events"
  on public.reservation_audit_events
  for select
  using (true);

drop policy if exists "Insert reservation audit events" on public.reservation_audit_events;
create policy "Insert reservation audit events"
  on public.reservation_audit_events
  for insert
  with check (true);

create or replace function public.check_in_reservation(
  p_code text,
  p_event_id text,
  p_actor_role text default 'staff',
  p_actor_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.reservations%rowtype;
  v_updated public.reservations%rowtype;
  v_message text;
begin
  select *
    into v_reservation
    from public.reservations
   where upper(code) = upper(trim(p_code))
     and event_id = p_event_id
   limit 1;

  if not found then
    v_message := 'Código inválido';

    insert into public.reservation_audit_events (
      event_id,
      reservation_code,
      type,
      reason,
      message,
      actor_role,
      actor_id
    ) values (
      p_event_id,
      trim(p_code),
      'check_in_invalid',
      'invalid',
      v_message,
      p_actor_role,
      p_actor_id
    );

    return jsonb_build_object(
      'ok', false,
      'reason', 'invalid',
      'message', v_message
    );
  end if;

  if v_reservation.status = 'Ingresó' then
    v_message := 'Ingreso duplicado · QR ya utilizado';

    insert into public.reservation_audit_events (
      reservation_id,
      event_id,
      reservation_code,
      type,
      reason,
      message,
      actor_role,
      actor_id
    ) values (
      v_reservation.id,
      v_reservation.event_id,
      v_reservation.code,
      'check_in_duplicate',
      'duplicate',
      v_message,
      p_actor_role,
      p_actor_id
    );

    return jsonb_build_object(
      'ok', false,
      'reason', 'duplicate',
      'message', v_message,
      'reservation', to_jsonb(v_reservation)
    );
  end if;

  if v_reservation.status = 'Cancelada' then
    v_message := 'Reserva cancelada';

    insert into public.reservation_audit_events (
      reservation_id,
      event_id,
      reservation_code,
      type,
      reason,
      message,
      actor_role,
      actor_id
    ) values (
      v_reservation.id,
      v_reservation.event_id,
      v_reservation.code,
      'check_in_cancelled',
      'cancelled',
      v_message,
      p_actor_role,
      p_actor_id
    );

    return jsonb_build_object(
      'ok', false,
      'reason', 'cancelled',
      'message', v_message,
      'reservation', to_jsonb(v_reservation)
    );
  end if;

  update public.reservations
     set status = 'Ingresó',
         checked_in_at = now()
   where id = v_reservation.id
   returning * into v_updated;

  v_message := 'Ingreso registrado';

  insert into public.reservation_audit_events (
    reservation_id,
    event_id,
    reservation_code,
    type,
    reason,
    message,
    actor_role,
    actor_id
  ) values (
    v_updated.id,
    v_updated.event_id,
    v_updated.code,
    'check_in_success',
    'ok',
    v_message,
    p_actor_role,
    p_actor_id
  );

  return jsonb_build_object(
    'ok', true,
    'reason', 'ok',
    'message', v_message,
    'reservation', to_jsonb(v_updated)
  );
end;
$$;
