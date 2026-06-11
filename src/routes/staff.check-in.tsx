import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Shield, Camera, Search, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/check-in")({
  component: CheckIn,
});

function CheckIn() {
  const event = useStore((s) => s.events[0]);
  const reservations = useStore((s) => s.reservations.filter((r) => r.eventId === event.id));
  const checkedIn = reservations.filter((r) => r.status === "Ingresó").length;
  const checkIn = useStore((s) => s.checkIn);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string; resCode?: string } | null>(null);

  const onValidate = () => {
    if (!code.trim()) return;
    const r = checkIn(code);
    setResult({ ok: r.ok, message: r.message, resCode: r.reservation?.code });
    if (r.ok) toast.success(`Ingreso registrado: ${r.reservation?.code}`);
    else toast.error(r.message);
    setCode("");
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <header className="flex items-center gap-3 pt-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary glow-primary">
          <Shield className="h-5 w-5 text-white" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Control de Ingreso</h1>
          <p className="text-xs text-muted-foreground">Staff — {event.name}</p>
        </div>
      </header>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <div>
            <p className="font-bold">{event.name}</p>
            <p className="text-xs text-muted-foreground">{event.date} · {event.startTime} hs · En curso</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-success">+{checkedIn}</p>
          <p className="text-[10px] text-muted-foreground">ingresaron</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
        <div className="relative mx-auto h-32 w-32">
          <div className="absolute inset-0 rounded-lg border-2 border-transparent" style={{ borderImage: "linear-gradient(135deg, var(--color-primary), var(--color-magenta)) 1" }} />
          <Camera className="absolute inset-0 m-auto h-12 w-12 text-primary" />
        </div>
        <p className="text-sm font-bold">Lector QR</p>
        <p className="text-xs text-muted-foreground">Apuntá la cámara al código QR del asistente</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground">O INGRESÁ EL CÓDIGO MANUALMENTE</p>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3">
          <Search className="h-4 w-4 text-primary" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="EJ: SN-004"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">Prueba: SN-001 (válida) · SN-002 (usada) · otro código (inválida)</p>
        <button
          onClick={onValidate}
          disabled={!code.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-bold text-white glow-primary disabled:opacity-40"
        >
          <Shield className="h-4 w-4" /> Validar Reserva
        </button>
      </div>

      {result && (
        <div className={`flex items-center gap-3 rounded-2xl border p-4 ${
          result.ok ? "border-success/40 bg-success/10 text-success" :
          result.resCode ? "border-warning/40 bg-warning/10 text-warning" :
          "border-destructive/40 bg-destructive/10 text-destructive"
        }`}>
          {result.ok ? <CheckCircle2 className="h-6 w-6" /> : result.resCode ? <AlertCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
          <div>
            <p className="font-bold">{result.message}</p>
            {result.resCode && <p className="text-xs opacity-80">{result.resCode}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
