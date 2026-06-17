import { useEffect } from 'react';
import { toast } from 'sonner';
import { listReservations, reservationFromRealtimePayload } from './reservations-api';
import { getSupabase, isSupabaseConfigured } from './supabase';
import { useStore } from './store';

export function useReservationsSync() {
  const setReservations = useStore((s) => s.setReservations);
  const upsertReservation = useStore((s) => s.upsertReservation);

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

    const channel = supabase
      .channel('reservations-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          const reservation = reservationFromRealtimePayload(payload);
          if (reservation) upsertReservation(reservation);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') toast.error('Realtime de reservas desconectado');
      });

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [setReservations, upsertReservation]);
}
