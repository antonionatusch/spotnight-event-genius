import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useStore } from "@/lib/store";
import { Plus, TrendingUp, Users, Ticket, DollarSign, Percent, Activity } from "lucide-react";

export const Route = createFileRoute("/owner/dashboard")({
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const events = useStore((s) => s.events);
  const reservations = useStore((s) => s.reservations);
  const confirmed = reservations.filter((r) => r.status !== "Cancelada").length;
  const checkedIn = reservations.filter((r) => r.status === "Ingresó").length;
  const revenue = reservations.reduce((acc, r) => acc + r.totalAmount, 0);
  const commission = reservations.reduce((acc, r) => acc + r.spotNightCommission, 0);
  const capacity = events.reduce((a, e) => a + e.ticketTypes.reduce((b, t) => b + t.capacity, 0), 0);
  const available = events.reduce((a, e) => a + e.ticketTypes.reduce((b, t) => b + t.available, 0), 0);
  const occupancy = Math.round(((capacity - available) / capacity) * 100);

  const metrics = [
    { label: "Eventos activos", value: events.filter((e) => e.status === "active").length, icon: Activity, color: "text-primary" },
    { label: "Reservas", value: confirmed, icon: Ticket, color: "text-magenta" },
    { label: "Ingresos validados", value: checkedIn, icon: Users, color: "text-success" },
    { label: "Cupos disponibles", value: available, icon: TrendingUp, color: "text-neon" },
    { label: "Ocupación", value: occupancy + "%", icon: Percent, color: "text-gold" },
    { label: "Ingreso est.", value: "Bs. " + revenue, icon: DollarSign, color: "text-success" },
  ];

  return (
    <div>
      <AppHeader />
      <main className="px-4 py-4 space-y-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-muted-foreground">PROPIETARIO</p>
          <h1 className="text-2xl font-bold">SpotNight Club</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-border bg-card p-3">
              <m.icon className={`h-5 w-5 ${m.color}`} />
              <p className="mt-2 text-2xl font-bold">{m.value}</p>
              <p className="text-[11px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4">
          <p className="text-xs font-bold tracking-widest text-primary">COMISIÓN SPOTNIGHT</p>
          <p className="mt-1 text-3xl font-bold text-gradient">Bs. {commission}</p>
          <p className="text-xs text-muted-foreground">10% sobre reservas confirmadas</p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground">EVENTOS</h2>
          <Link to="/owner/events/new" className="flex items-center gap-1.5 rounded-full gradient-primary px-3 py-1.5 text-xs font-bold text-white glow-primary">
            <Plus className="h-3 w-3" /> Crear evento
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {events.map((e, i) => (
            <Link
              key={e.id}
              to="/owner/events/$id/reservations"
              params={{ id: e.id }}
              className={`flex items-center gap-3 p-3 ${i > 0 ? "border-t border-border" : ""}`}
            >
              <img src={e.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.date} · {e.venueName}</p>
              </div>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">{e.status}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
