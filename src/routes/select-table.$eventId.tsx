import { createFileRoute, useNavigate, useParams, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { InteractiveVenueMap, MapLegend } from "@/components/InteractiveVenueMap";
import { useStore, type Floor, type VenueMapItem, type TicketKind } from "@/lib/store";

type Search = { ticket?: TicketKind };

export const Route = createFileRoute("/select-table/$eventId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ticket: (s.ticket as TicketKind) ?? "Mesa",
  }),
  component: SelectTable,
});

function SelectTable() {
  const { eventId } = useParams({ from: "/select-table/$eventId" });
  const { ticket } = useSearch({ from: "/select-table/$eventId" });
  const event = useStore((s) => s.events.find((e) => e.id === eventId));
  const navigate = useNavigate();

  const initialFloor: Floor = ticket === "VIP" ? "planta_alta" : "planta_baja";
  const [floor, setFloor] = useState<Floor>(initialFloor);
  const [selected, setSelected] = useState<VenueMapItem | null>(null);

  if (!event) return <div className="p-6">Evento no encontrado</div>;

  const continueReserve = () => {
    if (!selected) return;
    navigate({
      to: "/reserve/$eventId",
      params: { eventId },
      search: { ticket, itemId: selected.id } as never,
    });
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <header className="flex items-start gap-3 pt-2">
        <Link to="/event/$id" params={{ id: eventId }} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Seleccioná tu ubicación</h1>
          <p className="text-xs text-muted-foreground">
            {event.name} · Tocá una {ticket === "Silla" ? "silla" : "mesa"} disponible
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 rounded-full border border-border bg-card p-1">
        <button
          onClick={() => { setFloor("planta_baja"); setSelected(null); }}
          className={`rounded-full py-2.5 text-sm font-bold ${floor === "planta_baja" ? "gradient-primary text-white glow-primary" : "text-muted-foreground"}`}
        >
          🍾 Planta Baja
        </button>
        <button
          onClick={() => { setFloor("planta_alta"); setSelected(null); }}
          className={`rounded-full py-2.5 text-sm font-bold ${floor === "planta_alta" ? "bg-gold text-black glow-gold" : "text-muted-foreground"}`}
        >
          ⭐ Planta Alta / VIP
        </button>
      </div>

      <InteractiveVenueMap floor={floor} selectedId={selected?.id ?? null} onSelect={setSelected} />

      <MapLegend />

      {selected ? (
        <div className="rounded-2xl border border-magenta/40 bg-card p-4 space-y-2 glow-magenta">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{selected.zone === "VIP" ? "Mesa VIP" : selected.type === "seat" ? "Silla" : "Mesa"}</p>
              <h3 className="text-xl font-bold">{selected.label}</h3>
              <p className="text-xs text-muted-foreground">{floor === "planta_alta" ? "Planta Alta" : "Planta Baja"} · Zona {selected.zone}</p>
            </div>
            <p className="text-2xl font-bold text-gradient">Bs. {selected.price}</p>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>Capacidad: <b className="text-foreground">{selected.capacity} pers.</b></span>
            <span>Estado: <b className="text-success">Disponible</b></span>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-card/40 p-4 text-center text-sm text-muted-foreground">
          Tocá una {ticket === "Silla" ? "silla" : "mesa"} disponible en el mapa para seleccionarla
        </p>
      )}

      <button
        disabled={!selected}
        onClick={continueReserve}
        className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 text-base font-bold text-white glow-primary disabled:opacity-40"
      >
        Continuar reserva <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
