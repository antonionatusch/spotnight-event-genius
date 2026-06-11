import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useStore } from "@/lib/store";
import { Clock, MapPin, Flame, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpotNight — Explorá la noche" },
      { name: "description", content: "Eventos, mesas y VIP en los mejores boliches." },
    ],
  }),
  component: Home,
});

function Home() {
  const events = useStore((s) => s.events);
  const featured = events.find((e) => e.isFeatured) ?? events[0];
  const rest = events.filter((e) => e.id !== featured.id);

  return (
    <div>
      <AppHeader />
      <main className="px-4 py-4 space-y-6">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-widest text-muted-foreground">EVENTO DESTACADO</h2>
            <button className="flex items-center gap-1 text-xs font-medium text-gradient">
              Ver todos <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <Link to="/event/$id" params={{ id: featured.id }} className="block">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative h-44">
                <img src={featured.imageUrl} alt={featured.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                {featured.hot && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-magenta/60 bg-black/40 px-2.5 py-1 text-[11px] font-bold text-magenta backdrop-blur">
                    <Flame className="h-3 w-3" /> HOT
                  </span>
                )}
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <span className="rounded-full border border-gold/60 bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-gold backdrop-blur">VIP</span>
                  <span className="rounded-full border border-primary/60 bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-primary backdrop-blur">Mesas</span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-2xl font-bold">{featured.name}</h3>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {featured.date} · {featured.startTime}
                    </span>
                    <span className="font-bold text-success">desde Bs. {Math.min(...featured.ticketTypes.map((t) => t.price))}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {featured.venueName}
                </span>
                <span className="gradient-primary rounded-full px-4 py-1.5 text-xs font-bold text-white glow-primary">Reservar</span>
              </div>
            </div>
          </Link>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-bold tracking-widest text-muted-foreground">PRÓXIMOS EVENTOS</h2>
          <div className="space-y-3">
            {rest.map((e) => (
              <Link key={e.id} to="/event/$id" params={{ id: e.id }} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                <img src={e.imageUrl} alt={e.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold truncate">{e.name}</h3>
                    <span className="shrink-0 text-sm font-bold text-success">Bs. {Math.min(...e.ticketTypes.map((t) => t.price))}</span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 text-primary" /> {e.venueName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {e.date} · {e.startTime}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {e.ticketTypes.slice(0, 2).map((t) => (
                      <span key={t.id} className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        t.name === "VIP" ? "bg-gold/15 text-gold" : "bg-primary/15 text-primary"
                      }`}>
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
