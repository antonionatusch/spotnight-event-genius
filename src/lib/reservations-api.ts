import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getSupabase } from './supabase';
import type { Reservation } from './store';

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

export async function cancelRemoteReservation(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reservations')
    .update({ status: 'Cancelada', cancelled_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return reservationFromRow(data as ReservationRow);
}

export async function checkInRemoteReservation(rawCode: string, fallbackEventId?: string): Promise<CheckInResult> {
  const supabase = getSupabase();
  const parsed = parseQrPayload(rawCode);
  const eventId = parsed.eventId ?? fallbackEventId;

  if (!eventId) {
    return { ok: false, reason: 'invalid', message: 'El QR no incluye evento' };
  }

  const { data, error } = await supabase.rpc('check_in_reservation', {
    p_code: parsed.code,
    p_event_id: eventId,
  });

  if (error) throw error;

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

export function reservationFromRealtimePayload(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
  const row = payload.new as ReservationRow | null;
  if (!row?.id) return null;
  return reservationFromRow(row);
}
