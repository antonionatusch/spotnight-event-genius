import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useStore, type Reservation } from "@/lib/store";
import { useMemo, useState } from "react";
import { Calendar, MapPin, QrCode } from "lucide-react";

export const Route = createFileRoute("/my-reservations")({
  component: MyReservations,
});

type TabKey = "active" | "used" | "cancelled";

const tabs: { key: TabKey; label: string; color: string }[] = [
  { key: "active", label: "Activas", color: "bg-success/15 text-success border-success/40" },
  { key: "used", label: "Utilizadas", color: "bg-primary/15 text-primary border-primary/40" },
  { key: "cancelled", label: "Canceladas", color: "bg-destructive/15 text-destructive border-destructive/40" },
];

function MyReservations() {
  const reservations = useStore((s) => s.reservations);
  const [tab, setTab] = useState<TabKey>("active");

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (tab === "active") return r.status === "Confirmada";
      if (tab === "used") return r.status === "Ingresó";
      return r.status === "Cancelada";
    });
  }, [reservations, tab]);

  const count = (k: TabKey) =>
    reservations.filter((r) =>
      k === "active" ? r.status === "Confirmada" : k === "used" ? r.status === "Ingresó" : r.status === "Cancelada",
    ).length;

  return (
    <div>
      <AppHeader />
      <main className="px-4 py-4 space-y-4">
        <h1 className="text-2xl font-bold">Mis reservas</h1>
        <div className="grid grid-cols-3 gap-2 rounded-full border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full py-2 text-xs font-bold transition ${
                tab === t.key ? "gradient-primary text-white" : "text-muted-foreground"
              }`}
            >
              {t.label} <span className="opacity-70">({count(t.key)})</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((r) => (
            <ReservationCard key={r.id} r={r} tab={tab} />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">
              No hay reservas {tab === "active" ? "activas" : tab === "used" ? "utilizadas" : "canceladas"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function ReservationCard({ r, tab }: { r: Reservation; tab: TabKey }) {
  const badge =
    r.status === "Ingresó"
      ? "bg-primary/15 text-primary border-primary/40"
      : r.status === "Confirmada"
      ? "bg-success/15 text-success border-success/40"
      : "bg-destructive/15 text-destructive border-destructive/40";

  return (
    <div className={`rounded-2xl border bg-card p-4 space-y-2 ${
      r.status === "Cancelada" ? "border-destructive/30 opacity-75" :
      r.status === "Ingresó" ? "border-primary/30" :
      "border-success/30"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{r.code}</p>
          <h3 className="font-bold truncate">{r.eventName}</h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{r.venueName}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${badge}`}>{r.status}</span>
      </div>

      {r.venueMapItemLabel && (
        <p className="text-xs text-muted-foreground">
          {r.floor === "planta_alta" ? "Planta Alta" : "Planta Baja"} · <span className="text-magenta font-bold">{r.venueMapItemLabel}</span> · Zona {r.zone} · {r.peopleCount} pers.
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> Sáb 14 Jun</span>
        {tab === "active" ? (
          <Link
            to="/reservation/$id"
            params={{ id: r.id }}
            className="flex items-center gap-1.5 rounded-full gradient-primary px-3 py-1.5 text-xs font-bold text-white glow-primary"
          >
            <QrCode className="h-3 w-3" /> Ver QR
          </Link>
        ) : (
          <Link
            to="/reservation/$id"
            params={{ id: r.id }}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
          >
            Ver detalle
          </Link>
        )}
      </div>
    </div>
  );
}
