import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getReservationCancellationMessage } from './cancellation-messages';
import { getSupabase } from './supabase';
import type { Reservation, ReservationAuditEvent } from './store';

type ReservationRow = {
  id: string;
  code: string;
  event_id: string;
  event_name: string;
  venue_name: string;
  user_name: string;
  ticket_type: Reservation['ticketType'];
  people_count: number;
  total_amount: number;
  spotnight_commission: number;
  status: Reservation['status'];
  venue_map_item_id: string | null;
  venue_map_item_label: string | null;
  zone: string | null;
  floor: Reservation['floor'] | null;
  created_at: string;
  checked_in_at: string | null;
  cancelled_at: string | null;
};

type ReservationAuditEventRow = {
  id: string;
  reservation_id: string | null;
  event_id: string;
  reservation_code: string;
  type: ReservationAuditEvent['type'];
  reason: string | null;
  message: string;
  actor_role: ReservationAuditEvent['actorRole'] | null;
  actor_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type NewReservationInput = Omit<Reservation, 'id' | 'code' | 'createdAt'>;

export type CheckInResult = {
  ok: boolean;
  reason?: 'ok' | 'invalid' | 'duplicate' | 'cancelled' | 'expired';
  message: string;
  reservation?: Reservation;
  duplicate?: boolean;
  expired?: boolean;
};

export function reservationFromRow(row: ReservationRow): Reservation {
  return {
    id: row.id,
    code: row.code,
    eventId: row.event_id,
    eventName: row.event_name,
    venueName: row.venue_name,
    userName: row.user_name,
    ticketType: row.ticket_type,
    peopleCount: row.people_count,
    totalAmount: row.total_amount,
    spotNightCommission: row.spotnight_commission,
    status: row.status,
    venueMapItemId: row.venue_map_item_id ?? undefined,
    venueMapItemLabel: row.venue_map_item_label ?? undefined,
    zone: row.zone ?? undefined,
    floor: row.floor ?? undefined,
    createdAt: row.created_at,
    checkedInAt: row.checked_in_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
  };
}

export function auditEventFromRow(row: ReservationAuditEventRow): ReservationAuditEvent {
  return {
    id: row.id,
    reservationId: row.reservation_id ?? undefined,
    eventId: row.event_id,
    reservationCode: row.reservation_code,
    type: row.type,
    reason: row.reason ?? undefined,
    message: row.message,
    actorRole: row.actor_role ?? undefined,
    actorId: row.actor_id ?? undefined,
    metadata: row.metadata ?? undefined,
    createdAt: row.created_at,
  };
}

function rowFromReservationInput(input: NewReservationInput) {
  return {
    event_id: input.eventId,
    event_name: input.eventName,
    venue_name: input.venueName,
    user_name: input.userName,
    ticket_type: input.ticketType,
    people_count: input.peopleCount,
    total_amount: input.totalAmount,
    spotnight_commission: input.spotNightCommission,
    status: input.status,
    venue_map_item_id: input.venueMapItemId ?? null,
    venue_map_item_label: input.venueMapItemLabel ?? null,
    zone: input.zone ?? null,
    floor: input.floor ?? null,
  };
}

export function parseQrPayload(raw: string) {
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed) as { code?: unknown; eventId?: unknown };
    return {
      code: typeof parsed.code === 'string' ? parsed.code : trimmed,
      eventId: typeof parsed.eventId === 'string' ? parsed.eventId : undefined,
    };
  } catch {
    return { code: trimmed, eventId: undefined };
  }
}

export async function listReservations() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ReservationRow[]).map(reservationFromRow);
}

export async function listReservationAuditEvents(eventId?: string) {
  const supabase = getSupabase();
  let query = supabase
    .from('reservation_audit_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (eventId) query = query.eq('event_id', eventId);

  const { data, error } = await query;

  if (error) throw error;
  return ((data ?? []) as ReservationAuditEventRow[]).map(auditEventFromRow);
}

export async function listAuditEventsForReservation(reservationId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reservation_audit_events')
    .select('*')
    .eq('reservation_id', reservationId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return ((data ?? []) as ReservationAuditEventRow[]).map(auditEventFromRow);
}

export async function createReservation(input: NewReservationInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reservations')
    .insert(rowFromReservationInput(input))
    .select('*')
    .single();

  if (error) throw error;
  return reservationFromRow(data as ReservationRow);
}

export async function deleteEventReservationsForDebug(eventId: string) {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase.rpc('delete_event_reservations_for_debug', {
      p_event_id: eventId,
    });

    if (error) throw error;
    return typeof data === 'number' ? data : 0;
  } catch (error) {
    if (!shouldRetryDirectDeleteReservations(error)) throw error;

    const { data, error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('event_id', eventId)
      .select('id');

    if (deleteError) throw deleteError;
    return data?.length ?? 0;
  }
}

export async function cancelRemoteReservation(
  id: string,
  actorRole: ReservationAuditEvent['actorRole'] = 'owner',
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reservations')
    .update({ status: 'Cancelada', cancelled_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  const reservation = reservationFromRow(data as ReservationRow);

  try {
    await createReservationAuditEvent({
      reservationId: reservation.id,
      eventId: reservation.eventId,
      reservationCode: reservation.code,
      type: 'reservation_cancelled',
      reason: 'cancelled',
      message: getReservationCancellationMessage(actorRole),
      actorRole,
    });
  } catch (error) {
    console.error(error);
  }

  return reservation;
}

export async function createReservationAuditEvent(
  input: Omit<ReservationAuditEvent, 'id' | 'createdAt'>,
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reservation_audit_events')
    .insert({
      reservation_id: input.reservationId ?? null,
      event_id: input.eventId,
      reservation_code: input.reservationCode,
      type: input.type,
      reason: input.reason ?? null,
      message: input.message,
      actor_role: input.actorRole ?? null,
      actor_id: input.actorId ?? null,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  if (error) throw error;
  return auditEventFromRow(data as ReservationAuditEventRow);
}

export async function checkInRemoteReservation(
  rawCode: string,
  fallbackEventId?: string,
): Promise<CheckInResult> {
  const supabase = getSupabase();
  const parsed = parseQrPayload(rawCode);
  const eventId = parsed.eventId ?? fallbackEventId;

  if (!eventId) {
    return { ok: false, reason: 'invalid', message: 'El QR no incluye evento' };
  }

  let data: unknown;
  try {
    const response = await supabase.rpc('check_in_reservation', {
      p_code: parsed.code,
      p_event_id: eventId,
      p_actor_role: 'staff',
      p_actor_id: null,
    });

    if (response.error) throw response.error;
    data = response.data;
  } catch (error) {
    if (!shouldRetryLegacyCheckInRpc(error)) throw error;

    const response = await supabase.rpc('check_in_reservation', {
      p_code: parsed.code,
      p_event_id: eventId,
    });

    if (response.error) throw response.error;
    data = response.data;
  }

  const payload = data as {
    ok: boolean;
    reason?: CheckInResult['reason'];
    message: string;
    reservation?: ReservationRow;
  };

  return {
    ok: payload.ok,
    reason: payload.reason,
    message: payload.message,
    reservation: payload.reservation ? reservationFromRow(payload.reservation) : undefined,
    duplicate: payload.reason === 'duplicate',
    expired: payload.reason === 'expired',
  };
}

function shouldRetryLegacyCheckInRpc(error: unknown) {
  const postgrestError = error as { code?: string; message?: string } | null;
  const message = postgrestError?.message ?? (error instanceof Error ? error.message : '');

  return (
    postgrestError?.code === 'PGRST202' ||
    message.includes('Could not find the function') ||
    message.includes('p_actor_id') ||
    message.includes('p_actor_role')
  );
}

function shouldRetryDirectDeleteReservations(error: unknown) {
  const postgrestError = error as { code?: string; message?: string } | null;
  const message = postgrestError?.message ?? (error instanceof Error ? error.message : '');

  return (
    postgrestError?.code === 'PGRST202' ||
    message.includes('Could not find the function') ||
    message.includes('delete_event_reservations_for_debug')
  );
}

export function reservationFromRealtimePayload(
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
) {
  const row = payload.new as ReservationRow | null;
  if (!row?.id) return null;
  return reservationFromRow(row);
}

export function auditEventFromRealtimePayload(
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
) {
  const row = payload.new as ReservationAuditEventRow | null;
  if (!row?.id) return null;
  return auditEventFromRow(row);
}
