import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { useMemo } from "react";

export const Route = createFileRoute("/my-qr")({
  component: MyQR,
});

function MyQR() {
  const allReservations = useStore((s) => s.reservations);
  const reservations = useMemo(
    () => allReservations.filter((r) => r.status === "Confirmada"),
    [allReservations],
  );
  const latest = reservations[0];
  if (!latest) {
    return (
      <div>
        <AppHeader />
        <div className="px-4 py-12 text-center text-muted-foreground">
          <p>No tenés reservas activas.</p>
          <Link to="/" className="mt-4 inline-block rounded-full gradient-primary px-4 py-2 text-sm font-bold text-white">Explorar eventos</Link>
        </div>
      </div>
    );
  }
  // redirect to most recent reservation QR
  if (typeof window !== "undefined") {
    window.location.replace(`/reservation/${latest.id}`);
  }
  return null;
}
