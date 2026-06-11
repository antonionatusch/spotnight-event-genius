import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { InteractiveVenueMap, MapLegend } from "@/components/InteractiveVenueMap";
import type { Floor } from "@/lib/store";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

function MapPage() {
  const [floor, setFloor] = useState<Floor>("planta_baja");
  return (
    <div>
      <AppHeader />
      <main className="px-4 py-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Mapa del local</h1>
          <p className="text-xs text-muted-foreground">La Tuti Viruli · Vista previa</p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-full border border-border bg-card p-1">
          <button onClick={() => setFloor("planta_baja")} className={`rounded-full py-2.5 text-sm font-bold ${floor === "planta_baja" ? "gradient-primary text-white glow-primary" : "text-muted-foreground"}`}>🍾 Planta Baja</button>
          <button onClick={() => setFloor("planta_alta")} className={`rounded-full py-2.5 text-sm font-bold ${floor === "planta_alta" ? "bg-gold text-black glow-gold" : "text-muted-foreground"}`}>⭐ Planta Alta / VIP</button>
        </div>
        <InteractiveVenueMap floor={floor} />
        <MapLegend />
      </main>
    </div>
  );
}
