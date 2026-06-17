import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Shield, Camera, Search, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { checkInRemoteReservation } from "@/lib/reservations-api";

export const Route = createFileRoute("/staff/check-in")({
  component: CheckIn,
});

function CheckIn() {
  const event = useStore((s) => s.events[0]);
  const allReservations = useStore((s) => s.reservations);
  const reservations = useMemo(
    () => (event ? allReservations.filter((r) => r.eventId === event.id) : []),
    [allReservations, event],
  );
  const checkedIn = reservations.filter((r) => r.status === "Ingresó").length;
  const localCheckIn = useStore((s) => s.checkIn);
  const upsertReservation = useStore((s) => s.upsertReservation);
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; resCode?: string; duplicate?: boolean; expired?: boolean } | null>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const validatingRef = useRef(false);
  const lastScanRef = useRef<{ rawCode: string; scannedAt: number } | null>(null);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (scanner) {
        void scanner.stop().catch(() => undefined);
        void scanner.clear().catch(() => undefined);
      }
    };
  }, []);

  if (!event) return <div className="p-6">Evento no encontrado</div>;

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      await scanner.stop();
      await scanner.clear();
    } catch {
      // Scanner may already be stopped.
    } finally {
      scannerRef.current = null;
      setScanning(false);
    }
  };

  const validateCode = async (rawCode: string) => {
    const normalizedCode = rawCode.trim();
    if (!normalizedCode || validatingRef.current) return;

    const lastScan = lastScanRef.current;
    const now = Date.now();
    if (lastScan?.rawCode === normalizedCode && now - lastScan.scannedAt < 3000) return;
    lastScanRef.current = { rawCode: normalizedCode, scannedAt: now };

    validatingRef.current = true;
    setValidating(true);
    try {
      const r = await checkInRemoteReservation(normalizedCode, event.id);
      if (r.reservation) upsertReservation(r.reservation);
      setResult({ ok: r.ok, message: r.message, resCode: r.reservation?.code, duplicate: r.duplicate, expired: r.expired });
      if (r.ok) {
        toast.success(`Acceso correcto: ${r.reservation?.code}`, { id: "check-in-result" });
        await stopScanner();
      } else {
        toast.error(r.message, { id: "check-in-result" });
      }
    } catch (error) {
      console.error(error);
      const r = localCheckIn(normalizedCode);
      setResult({ ok: r.ok, message: r.message, resCode: r.reservation?.code, duplicate: r.duplicate, expired: r.expired });
      if (r.ok) toast.success(`Ingreso local registrado: ${r.reservation?.code}`, { id: "check-in-result" });
      else toast.error(r.duplicate ? r.message : "No se pudo validar con Supabase", { id: "check-in-result" });
    } finally {
      validatingRef.current = false;
      setValidating(false);
      setCode("");
    }
  };

  const startScanner = async () => {
    if (scanning) {
      await stopScanner();
      return;
    }
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("staff-qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          void validateCode(decodedText);
        },
        () => undefined,
      );
      setScanning(true);
      toast.success("Cámara lista para escanear");
    } catch (error) {
      console.error(error);
      const scanner = scannerRef.current;
      if (scanner) {
        void scanner.clear().catch(() => undefined);
        scannerRef.current = null;
      }
      toast.error("No se pudo abrir la cámara");
      setScanning(false);
    }
  };

  const onValidate = () => {
    void validateCode(code);
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

      <div className="rounded-2xl border border-border bg-card p-4 text-center space-y-3">
        <div className="overflow-hidden rounded-xl border border-primary/40 bg-background/40">
          <div id="staff-qr-reader" className="min-h-48" />
          {!scanning && (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 rounded-lg border-2 border-transparent" style={{ borderImage: "linear-gradient(135deg, var(--color-primary), var(--color-magenta)) 1" }} />
                <Camera className="absolute inset-0 m-auto h-12 w-12 text-primary" />
              </div>
            </div>
          )}
        </div>
        <p className="text-sm font-bold">Lector QR</p>
        <p className="text-xs text-muted-foreground">Apuntá la cámara al código QR del asistente</p>
        <button
          onClick={startScanner}
          disabled={validating}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/50 bg-primary/10 py-3 text-sm font-bold text-primary disabled:opacity-40"
        >
          <Camera className="h-4 w-4" /> {scanning ? "Detener cámara" : "Iniciar cámara"}
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground">O INGRESÁ EL CÓDIGO MANUALMENTE</p>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3">
          <Search className="h-4 w-4 text-primary" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="EJ: SN-004 o pegá el JSON del QR"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">Acepta código corto o JSON del QR · Prueba: SN-001 (válida) · SN-002 (usada)</p>
        <button
          onClick={onValidate}
          disabled={!code.trim() || validating}
          className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-bold text-white glow-primary disabled:opacity-40"
        >
          <Shield className="h-4 w-4" /> {validating ? "Validando..." : "Validar Reserva"}
        </button>
      </div>

      {result && (
        <div className={`flex items-start gap-3 rounded-2xl border p-4 ${
          result.ok
            ? "border-success/40 bg-success/10 text-success"
            : result.duplicate || result.expired
            ? "border-destructive bg-destructive/15 text-destructive shadow-[0_0_24px_rgba(239,68,68,0.35)]"
            : "border-destructive/40 bg-destructive/10 text-destructive"
        }`}>
          {result.ok ? <CheckCircle2 className="h-6 w-6 shrink-0" /> : result.duplicate ? <AlertCircle className="h-6 w-6 shrink-0" /> : <XCircle className="h-6 w-6 shrink-0" />}
          <div className="flex-1">
            <p className="font-bold leading-tight">{result.duplicate || result.expired ? "⚠ " : ""}{result.message}</p>
            {result.resCode && <p className="text-xs opacity-80 mt-0.5">Reserva {result.resCode}</p>}
            {result.duplicate && <p className="text-[11px] opacity-90 mt-1">Esta reserva ya fue utilizada. Verificá la identidad del asistente.</p>}
            {result.expired && <p className="text-[11px] opacity-90 mt-1">El evento finalizó. No se permiten más ingresos.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
