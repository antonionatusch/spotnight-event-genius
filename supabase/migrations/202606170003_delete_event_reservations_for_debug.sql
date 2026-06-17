create or replace function public.delete_event_reservations_for_debug(p_event_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted_count integer;
begin
  delete from public.reservation_audit_events
   where event_id = p_event_id;

  delete from public.reservations
   where event_id = p_event_id;

  get diagnostics v_deleted_count = row_count;

  return v_deleted_count;
end;
$$;
