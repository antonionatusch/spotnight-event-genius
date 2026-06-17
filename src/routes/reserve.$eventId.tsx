import { createFileRoute, useNavigate, useParams, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, User, CheckCircle2, MapPinned, Layers, Tag } from "lucide-react";
import { useStore, type TicketKind } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createReservation } from "@/lib/reservations-api";
import { toast } from "sonner";

type Search = { ticket?: TicketKind; itemId?: string };

export const Route = createFileRoute("/reserve/$eventId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ticket: (s.ticket as TicketKind) ?? "General",
    itemId: s.itemId as string | undefined,
  }),
  component: Reserve,
});

function Reserve() {
  const { eventId } = useParams({ from: "/reserve/$eventId" });
  const { ticket = "General", itemId } = useSearch({ from: "/reserve/$eventId" });
  const event = useStore((s) => s.events.find((e) => e.id === eventId));
  const item = useStore((s) => (itemId ? s.venueMap.find((i) => i.id === itemId) : null));
  const upsertReservation = useStore((s) => s.upsertReservation);
  const navigate = useNavigate();
  const [name, setName] = useState("Carlos Mendoza");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!event) return <div className="p-6">Evento no encontrado</div>;

  const ticketType = event.ticketTypes.find((t) => t.name === ticket);
  const basePrice = item?.price ?? ticketType?.price ?? 0;
  const commission = Math.round(basePrice * 0.1);
  const total = basePrice;
  const people = item?.capacity ?? 1;
  const floorLabel = item?.floor === "planta_alta" ? "Planta Alta / VIP" : item?.floor === "planta_baja" ? "Planta Baja" : "—";

  const finalizeReservation = async () => {
    setSubmitting(true);
    try {
      const res = await createReservation({
        eventId: event.id,
        eventName: event.name,
        venueName: event.venueName,
        userName: name,
        ticketType: ticket,
        peopleCount: people,
        totalAmount: total,
        spotNightCommission: commission,
        status: "Confirmada",
        venueMapItemId: item?.id,
        venueMapItemLabel: item?.label,
        zone: item?.zone,
        floor: item?.floor,
      });
      upsertReservation(res);
      setConfirmOpen(false);
      toast.success("Reserva confirmada · QR generado");
      navigate({ to: "/reservation/$id", params: { id: res.id } });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo crear la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const row = (k: string, v: React.ReactNode, accent?: string) => (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className={`text-sm font-semibold ${accent ?? "text-foreground"}`}>{v}</span>
    </div>
  );

  return (
    <div className="px-4 py-4 space-y-4">
      <header className="flex items-start gap-3 pt-2">
        <Link to="/event/$id" params={{ id: eventId }} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Confirmar reserva</h1>
          <p className="text-xs text-muted-foreground">Revisá los detalles antes de confirmar</p>
        </div>
      </header>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl gradient-primary">
          <img src={event.imageUrl} alt="" className="h-full w-full object-cover opacity-80" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate">{event.name}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.startTime}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.venueName}</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-primary/15 px-4 py-2.5">
          <p className="text-xs font-bold tracking-widest text-primary">DETALLE DE RESERVA</p>
        </div>
        <div className="px-4">
          {row("Evento", event.name)}
          {row("Boliche", event.venueName)}
          {row("Fecha", event.date + " 2025")}
          {row("Hora", event.startTime + " hs")}
          {row("Tipo de reserva", `${ticket === "VIP" ? "Mesa VIP" : `Mesa ${ticket === "General" ? "General" : ticket}`}`, "text-primary")}
          {item && row("Planta", item.floor === "planta_alta" ? "Planta Alta" : "Planta Baja")}
          {item && row("Mesa", item.label, "text-magenta")}
          {item && row("Zona", `Zona ${item.zone}`)}
          {row("Capacidad", `${people} ${people === 1 ? "persona" : "personas"}`)}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card px-4">
        {row("Precio mesa", `Bs. ${basePrice}`)}
        {row("Comisión SpotNight (10%)", `Bs. ${commission}`)}
        <div className="flex items-center justify-between py-3">
          <span className="font-bold">Total estimado</span>
          <span className="text-lg font-bold text-success">Bs. {total}</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold tracking-widest text-muted-foreground">NOMBRE DEL TITULAR</p>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <button
        onClick={() => setConfirmOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 text-base font-bold text-white glow-primary"
      >
        <CheckCircle2 className="h-5 w-5" /> Confirmar reserva
      </button>
      <p className="text-center text-[11px] text-muted-foreground">
        Al confirmar aceptás los términos y condiciones de SpotNight
      </p>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[92vw] rounded-2xl border-primary/40 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gradient text-xl">Confirmá tu reserva</DialogTitle>
            <DialogDescription>
              Revisá la ubicación seleccionada antes de generar tu QR.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-sm font-bold">{event.name}</p>
              <p className="text-[11px] text-muted-foreground">{event.venueName} · {event.date} · {event.startTime} hs</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
                <Layers className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Planta</p>
                  <p className="text-sm font-bold">{floorLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
                <Tag className="h-4 w-4 text-gold" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Zona</p>
                  <p className="text-sm font-bold">{item ? `Zona ${item.zone}` : ticket}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-magenta/40 bg-magenta/10 p-3">
                <MapPinned className="h-4 w-4 text-magenta" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Mesa / Ubicación</p>
                  <p className="text-base font-bold text-magenta">{item?.label ?? "Sin asignar"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Titular</span>
              <span className="text-sm font-semibold">{name}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-base font-bold text-success">Bs. {total}</span>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <button
              onClick={finalizeReservation}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl gradient-primary py-3 text-sm font-bold text-white glow-primary disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" /> {submitting ? "Generando..." : "Confirmar y generar QR"}
            </button>
            <button
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
              className="w-full rounded-xl border border-border bg-card py-3 text-sm font-semibold text-muted-foreground disabled:opacity-50"
            >
              Revisar de nuevo
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
