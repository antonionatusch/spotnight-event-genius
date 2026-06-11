import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useStore, type TicketKind } from "@/lib/store";
import { useState } from "react";
import { Calendar, Clock, MapPin, Users, Star, ChevronRight, Wine, Armchair, Sparkles, Beer } from "lucide-react";

export const Route = createFileRoute("/event/$id")({
  component: EventDetail,
});

const iconMap: Record<TicketKind, typeof Wine> = {
  General: Beer,
  Mesa: Wine,
  Silla: Armchair,
  VIP: Star,
};

const colorMap: Record<TicketKind, string> = {
  General: "text-primary",
  Mesa: "text-neon",
  Silla: "text-magenta",
  VIP: "text-gold",
};

function EventDetail() {
  const { id } = useParams({ from: "/event/$id" });
  const event = useStore((s) => s.events.find((e) => e.id === id));
  const [selected, setSelected] = useState<TicketKind | null>(null);
  const navigate = useNavigate();

  if (!event) return <div className="p-6">Evento no encontrado</div>;

  const onContinue = () => {
    if (!selected) return;
    if (selected === "General") {
      navigate({ to: "/reserve/$eventId", params: { eventId: event.id }, search: { ticket: "General" } as never });
    } else {
      navigate({ to: "/select-table/$eventId", params: { eventId: event.id }, search: { ticket: selected } as never });
    }
  };

  return (
    <div>
      <AppHeader />
      <main className="space-y-4 px-4 py-4">
        <div className="relative -mx-4 h-52 overflow-hidden">
          <img src={event.imageUrl} alt={event.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-gold/60 bg-gold/10 px-2.5 py-1 text-[11px] font-bold text-gold">
              <Star className="h-3 w-3 fill-gold" /> VIP AVAILABLE
            </span>
            {event.rating && (
              <span className="flex items-center gap-1 text-sm font-bold text-gold">
                <Star className="h-4 w-4 fill-gold" /> {event.rating}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
        </div>

        <div className="grid grid-cols-4 divide-x divide-border rounded-2xl border border-border bg-card py-3 text-center text-[11px]">
          <div className="space-y-1">
            <Calendar className="mx-auto h-4 w-4 text-primary" />
            <p className="font-semibold">{event.date}</p>
          </div>
          <div className="space-y-1">
            <Clock className="mx-auto h-4 w-4 text-magenta" />
            <p className="font-semibold">{event.startTime} hs</p>
          </div>
          <div className="space-y-1">
            <MapPin className="mx-auto h-4 w-4 text-neon" />
            <p className="font-semibold truncate px-1">{event.venueName}</p>
          </div>
          <div className="space-y-1">
            <Users className="mx-auto h-4 w-4 text-success" />
            <p className="font-semibold">+{event.attendees ?? 100} asist.</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>

        <section>
          <h2 className="mb-2 text-xs font-bold tracking-widest text-muted-foreground">TIPO DE RESERVA</h2>
          <div className="space-y-2">
            {event.ticketTypes.map((t) => {
              const Icon = iconMap[t.name];
              const active = selected === t.name;
              const desc =
                t.name === "General" ? "Acceso libre a zona general" :
                t.name === "Mesa" ? "Mesa compartida (4 personas)" :
                t.name === "Silla" ? "Silla individual garantizada" :
                "Mesa VIP Planta Alta (6 pers.)";
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.name)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    active ? "border-neon bg-neon/5 glow-neon" : "border-border bg-card"
                  }`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-surface ${colorMap[t.name]}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${colorMap[t.name]}`}>Bs. {t.price}</p>
                  </div>
                  <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                    active ? "border-neon bg-neon glow-neon" : "border-border"
                  }`} />
                </button>
              );
            })}
          </div>
        </section>

        <div className="sticky bottom-24 pt-2">
          <button
            disabled={!selected}
            onClick={onContinue}
            className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 text-base font-bold text-white glow-primary disabled:opacity-40"
          >
            {selected === "General" || !selected ? "Continuar reserva" : "Seleccionar ubicación"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
