import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, MapPin, Users, Share2, Download, CheckCircle2, Copy, Check, AlertTriangle, XCircle, Layers, Tag, Hash, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cancelRemoteReservation } from "@/lib/reservations-api";

export const Route = createFileRoute("/reservation/$id")({
  component: ReservationPage,
});

function ReservationPage() {
  const { id } = useParams({ from: "/reservation/$id" });
  const reservation = useStore((s) => s.reservations.find((r) => r.id === id));
  const allAuditEvents = useStore((s) => s.auditEvents);
  const auditEvents = useMemo(
    () => allAuditEvents.filter((e) => e.reservationId === id),
    [allAuditEvents, id],
  );
  const isEventExpired = useStore((s) => s.isEventExpired);
  const cancelReservation = useStore((s) => s.cancelReservation);
  const upsertReservation = useStore((s) => s.upsertReservation);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const previousStatus = useRef(reservation?.status);
  const lastSeenAuditEventId = useRef<string | undefined>(auditEvents[0]?.id);

  useEffect(() => {
    if (previousStatus.current !== "Ingresó" && reservation?.status === "Ingresó") {
      toast.success("Acceso correcto, pase");
    }
    previousStatus.current = reservation?.status;
  }, [reservation?.status]);

  useEffect(() => {
    const latest = auditEvents[0];
    if (!latest || latest.id === lastSeenAuditEventId.current) return;

    lastSeenAuditEventId.current = latest.id;
    if (latest.type === "check_in_duplicate") {
      toast.error("Intento de ingreso duplicado · Tu QR ya fue utilizado", { id: "reservation-audit-alert" });
    } else if (latest.type === "check_in_success") {
      toast.success("Acceso correcto, pase", { id: "reservation-audit-alert" });
    } else if (latest.type === "check_in_cancelled" || latest.type === "check_in_expired") {
      toast.error(latest.message, { id: "reservation-audit-alert" });
    }
  }, [auditEvents]);

  if (!reservation) return <div className="p-6">Reserva no encontrada</div>;
  const r = reservation;
  const expired = isEventExpired(r.eventId);
  const cancelled = r.status === "Cancelada";
  const used = r.status === "Ingresó";
  const inactive = expired || cancelled || used;
  const latestDuplicate = auditEvents.find((event) => event.type === "check_in_duplicate");

  const qrPayload = JSON.stringify({
    code: r.code,
    eventId: r.eventId,
    event: r.eventName,
    ticketType: r.ticketType,
    itemId: r.venueMapItemId ?? null,
    item: r.venueMapItemLabel ?? null,
    floor: r.floor ?? null,
    zone: r.zone ?? null,
  });

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(r.code);
      setCopied(true);
      toast.success("Código copiado al portapapeles");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("No se pudo copiar el código");
    }
  };

  const onCancel = async () => {
    setCancelling(true);
    try {
      const updated = await cancelRemoteReservation(r.id, "user");
      upsertReservation(updated);
      setCancelOpen(false);
      toast.success("Reserva cancelada · cupo liberado");
      navigate({ to: "/my-reservations" });
    } catch (error) {
      console.error(error);
      cancelReservation(r.id);
      toast.error("No se pudo cancelar en Supabase; se canceló localmente");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <AppHeader />
      <main className="px-4 py-4 space-y-4">
        {expired && (
          <div className="flex items-center gap-2 rounded-2xl border border-destructive/50 bg-destructive/15 px-4 py-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-bold">Reserva Expirada · El evento ya finalizó</p>
          </div>
        )}
        {cancelled && (
          <div className="flex items-center gap-2 rounded-2xl border border-destructive/50 bg-destructive/15 px-4 py-3 text-destructive">
            <XCircle className="h-5 w-5" />
            <p className="text-sm font-bold">Reserva cancelada</p>
          </div>
        )}
        {used && (
          <div className="rounded-3xl border border-success/50 bg-success/15 p-5 text-center text-success shadow-[0_0_32px_rgba(34,197,94,0.25)]">
            <CheckCircle2 className="mx-auto h-10 w-10" />
            <p className="mt-2 text-2xl font-black">Acceso correcto</p>
            <p className="text-sm font-bold">Pase</p>
          </div>
        )}
        {latestDuplicate && (
          <div className="rounded-3xl border border-destructive/60 bg-destructive/15 p-5 text-center text-destructive shadow-[0_0_32px_rgba(239,68,68,0.25)]">
            <AlertTriangle className="mx-auto h-10 w-10" />
            <p className="mt-2 text-xl font-black">Intento duplicado detectado</p>
            <p className="text-sm font-bold">Tu QR ya fue utilizado</p>
            <p className="mt-1 text-xs opacity-80">{new Date(latestDuplicate.createdAt).toLocaleString()}</p>
          </div>
        )}
        {!inactive && (
          <div className="flex items-center gap-2 rounded-2xl border border-success/40 bg-success/10 px-4 py-3 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-bold">Reserva confirmada</p>
          </div>
        )}

        <div className={`rounded-3xl p-[2px] gradient-primary ${inactive ? "" : "glow-primary"}`}>
          <div className={`rounded-3xl bg-card p-5 space-y-4 ${inactive ? "opacity-60 grayscale" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-widest text-muted-foreground">CÓDIGO DE RESERVA</p>
                <p className="text-3xl font-bold text-gradient">{r.code}</p>
              </div>
              <button
                onClick={onCopy}
                className="flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs font-bold hover:border-primary/60"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>

            <div className="flex justify-center">
              <div className={`rounded-2xl bg-white p-3 ${inactive ? "grayscale opacity-70" : ""}`}>
                <QRCodeSVG value={qrPayload} size={200} />
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">Válido por un ingreso</p>

            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
              <InfoCell icon={<Hash className="h-3 w-3 text-primary" />} label="EVENTO" value={r.eventName} sub={`ID ${r.eventId}`} />
              <InfoCell icon={<MapPin className="h-3 w-3 text-primary" />} label="BOLICHE" value={r.venueName} />
              <InfoCell icon={<Calendar className="h-3 w-3 text-primary" />} label="FECHA" value="Sáb 14 Jun 2025" />
              <InfoCell icon={<Layers className="h-3 w-3 text-magenta" />} label="PLANTA" value={r.floor === "planta_alta" ? "Planta Alta / VIP" : r.floor === "planta_baja" ? "Planta Baja" : "—"} />
              <InfoCell icon={<Tag className="h-3 w-3 text-gold" />} label="ZONA" value={r.zone ? `Zona ${r.zone}` : r.ticketType} />
              <InfoCell icon={<MapPin className="h-3 w-3 text-magenta" />} label="MESA / SILLA" value={r.venueMapItemLabel ?? "General"} accent="text-magenta" />
              <InfoCell icon={<Users className="h-3 w-3 text-neon" />} label="PERSONAS" value={`${r.peopleCount} pers.`} />
              <InfoCell icon={<CheckCircle2 className="h-3 w-3 text-success" />} label="TIPO" value={r.ticketType} />
            </div>

            <div className={`rounded-xl border py-3 text-center ${
              cancelled ? "border-destructive/40 bg-destructive/10 text-destructive" :
              expired ? "border-destructive/40 bg-destructive/10 text-destructive" :
              used ? "border-primary/40 bg-primary/10 text-primary" :
              "border-success/40 bg-success/10 text-success"
            }`}>
              <p className="text-sm font-bold">● Estado: {cancelled ? "Cancelada" : expired ? "Expirada" : used ? "Ingresó" : "Válida"}</p>
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

        {!inactive && (
          <button
            onClick={() => setCancelOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/50 bg-destructive/10 py-3 text-sm font-bold text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Cancelar reserva
          </button>
        )}

        <Link to="/my-reservations" className="block text-center text-sm font-medium text-gradient">
          Ver mis reservas →
        </Link>

        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogContent className="max-w-[92vw] rounded-2xl border-destructive/40 bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive">¿Cancelar reserva?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Tu lugar {r.venueMapItemLabel ? <b>{r.venueMapItemLabel}</b> : "asignado"} quedará disponible para otros usuarios.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <button
                onClick={onCancel}
                disabled={cancelling}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" /> {cancelling ? "Cancelando..." : "Sí, cancelar reserva"}
              </button>
              <button
                onClick={() => setCancelOpen(false)}
                className="w-full rounded-xl border border-border bg-card py-3 text-sm font-semibold text-muted-foreground"
              >
                Volver
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function InfoCell({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">{icon}<span>{label}</span></div>
      <p className={`mt-0.5 font-bold leading-tight ${accent ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
