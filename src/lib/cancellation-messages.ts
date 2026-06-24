import type { Role } from './store';

export function getReservationCancellationMessage(actorRole?: Role) {
  if (actorRole === 'owner') {
    return 'Reserva cancelada por el propietario. Tu lugar fue liberado y no habrá devoluciones.';
  }

  if (actorRole === 'staff') {
    return 'Reserva cancelada por staff. Sí corresponde devolución; consultá con el staff para gestionarla.';
  }

  return 'Reserva cancelada. El cupo fue liberado.';
}
