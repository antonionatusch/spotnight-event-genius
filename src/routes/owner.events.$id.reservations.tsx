import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/owner/events/$id/reservations")({
  component: EventReservations,
});

function EventReservations() {
  const { id } = useParams({ from: "/owner/events/$id/reservations" });
  const event = useStore((s) => s.events.find((e) => e.id === id));
  const reservations = useStore((s) => s.reservations.filter((r) => r.eventId === id));
  if (!event) return <div className="p-6">Evento no encontrado</div>;
  const checkedIn = reservations.filter((r) => r.status === "Ingresó").length;
  const revenue = reservations.reduce((a, r) => a + r.totalAmount, 0);

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
        <div className="rounded-2xl border border-border bg-card p-3 text-center"><p className="text-2xl font-bold text-primary">{reservations.length}</p><p className="text-[10px] text-muted-foreground">Reservas</p></div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center"><p className="text-2xl font-bold text-success">{checkedIn}</p><p className="text-[10px] text-muted-foreground">Ingresaron</p></div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center"><p className="text-2xl font-bold text-gold">Bs.{revenue}</p><p className="text-[10px] text-muted-foreground">Ingreso</p></div>
      </div>

      <div className="space-y-2">
        {reservations.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{r.code}</p>
                <p className="font-bold">{r.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {r.ticketType}{r.venueMapItemLabel ? ` · ${r.floor === "planta_alta" ? "P. Alta" : "P. Baja"} · ${r.venueMapItemLabel}` : ""}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                r.status === "Ingresó" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
              }`}>{r.status}</span>
            </div>
          </div>
        ))}
        {reservations.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Sin reservas todavía</p>}
      </div>
    </div>
  );
}
