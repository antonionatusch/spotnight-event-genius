import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  auditEventFromRealtimePayload,
  listReservationAuditEvents,
  listReservations,
  reservationFromRealtimePayload,
} from './reservations-api';
import { getSupabase, isSupabaseConfigured } from './supabase';
import { useStore } from './store';

export function useReservationsSync() {
  const setReservations = useStore((s) => s.setReservations);
  const upsertReservation = useStore((s) => s.upsertReservation);
  const removeReservation = useStore((s) => s.removeReservation);
  const setAuditEvents = useStore((s) => s.setAuditEvents);
  const upsertAuditEvent = useStore((s) => s.upsertAuditEvent);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();

    let cancelled = false;

    listReservations()
      .then((reservations) => {
        if (!cancelled) setReservations(reservations);
      })
      .catch((error) => {
        console.error(error);
        toast.error('No se pudieron cargar las reservas');
      });

    listReservationAuditEvents()
      .then((events) => {
        if (!cancelled) setAuditEvents(events);
      })
      .catch((error) => {
        console.error(error);
        toast.error('No se pudo cargar la auditoría de reservas');
      });

    const channel = supabase
      .channel('reservations-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id?: unknown } | null)?.id;
            if (typeof deletedId === 'string') removeReservation(deletedId);
            return;
          }

          const reservation = reservationFromRealtimePayload(payload);
          if (reservation) upsertReservation(reservation);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') toast.error('Realtime de reservas desconectado');
      });

    const auditChannel = supabase
      .channel('reservation-audit-events-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservation_audit_events' },
        (payload) => {
          const event = auditEventFromRealtimePayload(payload);
          if (event) upsertAuditEvent(event);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') toast.error('Realtime de auditoría desconectado');
      });

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
      void supabase.removeChannel(auditChannel);
    };
  }, [removeReservation, setAuditEvents, setReservations, upsertAuditEvent, upsertReservation]);
}
