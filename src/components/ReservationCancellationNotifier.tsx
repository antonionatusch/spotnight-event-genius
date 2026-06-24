import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getReservationCancellationMessage } from '@/lib/cancellation-messages';
import { useStore } from '@/lib/store';

export function ReservationCancellationNotifier() {
  const role = useStore((s) => s.role);
  const auditEvents = useStore((s) => s.auditEvents);
  const mountedAt = useRef(Date.now());
  const seenCancellationIds = useRef(new Set<string>());

  useEffect(() => {
    const cancellations = auditEvents.filter((event) => event.type === 'reservation_cancelled');
    const newCancellation = cancellations.find(
      (event) =>
        !seenCancellationIds.current.has(event.id) &&
        new Date(event.createdAt).getTime() >= mountedAt.current,
    );

    cancellations.forEach((event) => seenCancellationIds.current.add(event.id));

    if (!newCancellation) return;
    if (role !== 'user') return;

    toast.error(getReservationCancellationMessage(newCancellation.actorRole), {
      id: `reservation-cancelled-${newCancellation.id}`,
      description: `Reserva ${newCancellation.reservationCode}`,
      duration: 10000,
    });
  }, [auditEvents, role]);

  return null;
}
