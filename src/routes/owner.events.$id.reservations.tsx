import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, type Reservation } from "@/lib/store";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cancelRemoteReservation } from "@/lib/reservations-api";

export const Route = createFileRoute("/owner/events/$id/reservations")({
  component: EventReservations,
});

function EventReservations() {
  const { id } = useParams({ from: "/owner/events/$id/reservations" });
  const event = useStore((s) => s.events.find((e) => e.id === id));
  const allReservations = useStore((s) => s.reservations);
  const reservations = useMemo(() => allReservations.filter((r) => r.eventId === id), [allReservations, id]);
  const cancelReservation = useStore((s) => s.cancelReservation);
  const upsertReservation = useStore((s) => s.upsertReservation);
  const [pending, setPending] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  if (!event) return <div className="p-6">Evento no encontrado</div>;

  const active = reservations.filter((r) => r.status !== "Cancelada");
  const checkedIn = reservations.filter((r) => r.status === "Ingresó").length;
  const revenue = active.reduce((a, r) => a + r.totalAmount, 0);

  const confirmCancel = async () => {
    if (!pending) return;
    setCancelling(true);
    try {
      const updated = await cancelRemoteReservation(pending.id);
      upsertReservation(updated);
      toast.success(`Reserva ${pending.code} cancelada · cupo liberado`);
      setPending(null);
    } catch (error) {
      console.error(error);
      cancelReservation(pending.id);
      toast.error("No se pudo cancelar en Supabase; se canceló localmente");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <header className="flex items-center gap-3">
        <Link to="/owner/dashboard" className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{event.name}</h1>
          <p className="text-xs text-muted-foreground">{event.date} · {event.startTime}</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border bg-card p-3 text-center"><p className="text-2xl font-bold text-primary">{active.length}</p><p className="text-[10px] text-muted-foreground">Reservas</p></div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center"><p className="text-2xl font-bold text-success">{checkedIn}</p><p className="text-[10px] text-muted-foreground">Ingresaron</p></div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center"><p className="text-2xl font-bold text-gold">Bs.{revenue}</p><p className="text-[10px] text-muted-foreground">Ingreso</p></div>
      </div>

      <div className="space-y-2">
        {reservations.map((r) => (
          <div key={r.id} className={`rounded-2xl border bg-card p-3 ${r.status === "Cancelada" ? "border-destructive/30 opacity-70" : "border-border"}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{r.code}</p>
                <p className="font-bold truncate">{r.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {r.ticketType}{r.venueMapItemLabel ? ` · ${r.floor === "planta_alta" ? "P. Alta" : "P. Baja"} · ${r.venueMapItemLabel}` : ""}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                r.status === "Ingresó" ? "bg-success/15 text-success" :
                r.status === "Cancelada" ? "bg-destructive/15 text-destructive" :
                "bg-primary/15 text-primary"
              }`}>{r.status}</span>
            </div>
            {r.status === "Confirmada" && (
              <button
                onClick={() => setPending(r)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-destructive/40 bg-destructive/5 py-2 text-xs font-bold text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Cancelar reserva
              </button>
            )}
          </div>
        ))}
        {reservations.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Sin reservas todavía</p>}
      </div>

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="max-w-[92vw] rounded-2xl border-destructive/40 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Cancelar reserva {pending?.code}</DialogTitle>
            <DialogDescription>
              {pending?.userName} perderá su reserva{pending?.venueMapItemLabel ? <> en <b>{pending.venueMapItemLabel}</b></> : null}. La ubicación se liberará y los ingresos se restarán en el dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <button onClick={confirmCancel} disabled={cancelling} className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive py-3 text-sm font-bold text-white disabled:opacity-50">
              <Trash2 className="h-4 w-4" /> {cancelling ? "Cancelando..." : "Confirmar cancelación"}
            </button>
            <button onClick={() => setPending(null)} className="w-full rounded-xl border border-border bg-card py-3 text-sm font-semibold text-muted-foreground">
              Volver
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
