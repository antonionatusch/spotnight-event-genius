import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, Users, Share2, Download, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/reservation/$id")({
  component: ReservationPage,
});

function ReservationPage() {
  const { id } = useParams({ from: "/reservation/$id" });
  const reservation = useStore((s) => s.reservations.find((r) => r.id === id));
  if (!reservation) return <div className="p-6">Reserva no encontrada</div>;

  const r = reservation;
  return (
    <div>
      <AppHeader />
      <main className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-2 rounded-2xl border border-success/40 bg-success/10 px-4 py-3 text-success">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-bold">Reserva confirmada</p>
        </div>

        <div className="rounded-3xl p-[2px] gradient-primary glow-primary">
          <div className="rounded-3xl bg-card p-5 space-y-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-muted-foreground">CÓDIGO DE RESERVA</p>
              <p className="text-3xl font-bold text-gradient">{r.code}</p>
            </div>
            <div className="flex justify-center">
              <div className="rounded-2xl bg-white p-3">
                <QRCodeSVG value={JSON.stringify({ code: r.code, event: r.eventName })} size={200} />
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">Válido por un ingreso</p>
            <div className="grid grid-cols-2 gap-y-3 border-t border-border pt-4 text-xs">
              <div><p className="text-muted-foreground">EVENTO</p><p className="font-bold">{r.eventName}</p></div>
              <div><p className="text-muted-foreground">BOLICHE</p><p className="font-bold">{r.venueName}</p></div>
              <div className="flex items-start gap-1"><Calendar className="h-3 w-3 mt-0.5 text-primary" /><div><p className="text-muted-foreground">FECHA</p><p className="font-bold">Sáb 14 Jun 2025</p></div></div>
              {r.floor && <div className="flex items-start gap-1"><MapPin className="h-3 w-3 mt-0.5 text-magenta" /><div><p className="text-muted-foreground">PLANTA</p><p className="font-bold">{r.floor === "planta_alta" ? "Planta Alta" : "Planta Baja"}</p></div></div>}
              {r.venueMapItemLabel && <div><p className="text-muted-foreground">MESA</p><p className="font-bold text-magenta">Mesa {r.venueMapItemLabel}</p></div>}
              <div className="flex items-start gap-1"><Users className="h-3 w-3 mt-0.5 text-neon" /><div><p className="text-muted-foreground">PERSONAS</p><p className="font-bold">{r.peopleCount} personas</p></div></div>
            </div>
            <div className="rounded-xl border border-success/40 bg-success/10 py-3 text-center">
              <p className="text-sm font-bold text-success">● Estado: {r.status === "Ingresó" ? "Ingresó" : "Válida"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold">
            <Share2 className="h-4 w-4" /> Compartir
          </button>
          <button className="flex items-center justify-center gap-2 rounded-2xl gradient-primary py-3 text-sm font-bold text-white glow-primary">
            <Download className="h-4 w-4" /> Descargar
          </button>
        </div>

        <Link to="/my-reservations" className="block text-center text-sm font-medium text-gradient">
          Ver mis reservas →
        </Link>
      </main>
    </div>
  );
}
