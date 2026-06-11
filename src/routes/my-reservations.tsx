import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Calendar, MapPin, QrCode } from "lucide-react";

export const Route = createFileRoute("/my-reservations")({
  component: MyReservations,
});

function MyReservations() {
  const reservations = useStore((s) => s.reservations);
  const [tab, setTab] = useState<"active" | "past">("active");
  const filtered = reservations.filter((r) => (tab === "active" ? r.status !== "Cancelada" : r.status === "Ingresó"));

  return (
    <div>
      <AppHeader />
      <main className="px-4 py-4 space-y-4">
        <h1 className="text-2xl font-bold">Mis reservas</h1>
        <div className="grid grid-cols-2 gap-2 rounded-full border border-border bg-card p-1">
          <button onClick={() => setTab("active")} className={`rounded-full py-2 text-sm font-bold ${tab === "active" ? "gradient-primary text-white" : "text-muted-foreground"}`}>Activas</button>
          <button onClick={() => setTab("past")} className={`rounded-full py-2 text-sm font-bold ${tab === "past" ? "gradient-primary text-white" : "text-muted-foreground"}`}>Pasadas</button>
        </div>
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{r.code}</p>
                  <h3 className="font-bold">{r.eventName}</h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{r.venueName}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  r.status === "Ingresó" ? "bg-success/15 text-success" :
                  r.status === "Confirmada" ? "bg-primary/15 text-primary" :
                  "bg-destructive/15 text-destructive"
                }`}>{r.status}</span>
              </div>
              {r.venueMapItemLabel && (
                <p className="text-xs text-muted-foreground">
                  {r.floor === "planta_alta" ? "Planta Alta" : "Planta Baja"} · <span className="text-magenta font-bold">{r.venueMapItemLabel}</span> · {r.peopleCount} pers.
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> Sáb 14 Jun</span>
                <Link to="/reservation/$id" params={{ id: r.id }} className="flex items-center gap-1.5 rounded-full gradient-primary px-3 py-1.5 text-xs font-bold text-white">
                  <QrCode className="h-3 w-3" /> Ver QR
                </Link>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-12">No hay reservas</p>}
        </div>
      </main>
    </div>
  );
}
