import { useMemo } from "react";
import { useStore, type Floor, type VenueMapItem } from "@/lib/store";

type Props = {
  floor: Floor;
  selectedId?: string | null;
  onSelect?: (item: VenueMapItem) => void;
  filterTypes?: VenueMapItem["type"][]; // limit reservable types e.g. by ticket
};

const W = 460;
const H = 560;

export function InteractiveVenueMap({ floor, selectedId, onSelect, filterTypes }: Props) {
  const venueMap = useStore((s) => s.venueMap);
  const items = useMemo(() => venueMap.filter((i) => i.floor === floor), [venueMap, floor]);
  const isVip = floor === "planta_alta";

  const frameStroke = isVip ? "oklch(0.82 0.15 85)" : "oklch(0.78 0.18 220 / 0.7)";
  const bg = isVip ? "oklch(0.16 0.04 80 / 0.6)" : "oklch(0.13 0.02 280)";

  const getFill = (it: VenueMapItem) => {
    if (it.zone === "VIP") return "oklch(0.45 0.15 85 / 0.35)";
    if (it.type === "stage") return "transparent";
    if (it.type === "bar") return "oklch(0.35 0.12 85 / 0.35)";
    if (it.type === "dance_floor") return "transparent";
    if (it.type === "bathroom" || it.type === "entrance" || it.type === "stairs") return "transparent";
    if (it.type === "area") return "transparent";
    // reservable
    const status = it.status ?? "available";
    if (it.id === selectedId) return "oklch(0.6 0.28 0 / 0.4)";
    if (status === "available") return "oklch(0.25 0.1 220 / 0.4)";
    if (status === "reserved") return "oklch(0.4 0.02 280 / 0.5)";
    if (status === "occupied") return "oklch(0.4 0.18 25 / 0.5)";
    return "transparent";
  };
  const getStroke = (it: VenueMapItem) => {
    if (it.zone === "VIP" && (it.type === "table" || it.type === "booth")) return "oklch(0.82 0.15 85)";
    if (it.type === "stage") return "oklch(0.58 0.27 295)";
    if (it.type === "bar") return "oklch(0.82 0.15 85)";
    if (it.type === "dance_floor") return "oklch(0.58 0.27 295 / 0.6)";
    if (it.type === "bathroom" || it.type === "stairs") return "oklch(0.78 0.02 280)";
    if (it.type === "entrance") return "oklch(0.74 0.18 155)";
    if (it.type === "area") return "oklch(0.82 0.15 85 / 0.5)";
    const status = it.status ?? "available";
    if (it.id === selectedId) return "oklch(0.66 0.27 0)";
    if (status === "available") return "oklch(0.78 0.18 220)";
    if (status === "reserved") return "oklch(0.6 0.02 280)";
    if (status === "occupied") return "oklch(0.65 0.24 25)";
    return "white";
  };

  const isReservable = (it: VenueMapItem) =>
    ["table", "seat", "booth"].includes(it.type) &&
    (!filterTypes || filterTypes.includes(it.type));

  return (
    <div className="rounded-2xl border-2 p-2" style={{ borderColor: frameStroke, background: bg }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {isVip && (
          <text x={W / 2} y={30} textAnchor="middle" fill="oklch(0.82 0.15 85)" fontSize="14" letterSpacing="4" fontWeight="700">
            ✦ PLANTA VIP ✦
          </text>
        )}
        {items.map((it) => {
          const reservable = isReservable(it);
          const disabled = reservable && (it.status === "reserved" || it.status === "occupied");
          const handleClick = () => {
            if (!reservable || disabled) return;
            onSelect?.(it);
          };
          const fill = getFill(it);
          const stroke = getStroke(it);
          const isSelected = it.id === selectedId;
          const cursor = reservable && !disabled ? "pointer" : "default";

          // Shape rendering
          let shape: React.ReactNode = null;
          if (it.radius) {
            shape = (
              <circle cx={it.x} cy={it.y} r={it.radius} fill={fill} stroke={stroke} strokeWidth={isSelected ? 3 : 2} />
            );
          } else if (it.type === "stage") {
            shape = (
              <ellipse cx={it.x} cy={it.y} rx={(it.width ?? 100) / 2} ry={(it.height ?? 30) / 2} fill="transparent" stroke={stroke} strokeWidth={2} />
            );
          } else if (it.type === "dance_floor" || it.type === "area") {
            shape = (
              <rect
                x={it.x - (it.width ?? 60) / 2}
                y={it.y - (it.height ?? 40) / 2}
                width={it.width ?? 60}
                height={it.height ?? 40}
                rx={12}
                fill={fill}
                stroke={stroke}
                strokeWidth={1.5}
                strokeDasharray="6 4"
              />
            );
          } else {
            shape = (
              <rect
                x={it.x - (it.width ?? 40) / 2}
                y={it.y - (it.height ?? 30) / 2}
                width={it.width ?? 40}
                height={it.height ?? 30}
                rx={8}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 3 : 2}
              />
            );
          }

          const labelColor =
            it.zone === "VIP" ? "oklch(0.82 0.15 85)" :
            it.type === "entrance" ? "oklch(0.74 0.18 155)" :
            it.type === "stage" || it.type === "dance_floor" ? "oklch(0.58 0.27 295)" :
            disabled ? "oklch(0.78 0.02 280)" :
            "white";

          return (
            <g key={it.id} onClick={handleClick} style={{ cursor }} opacity={disabled ? 0.55 : 1}>
              {shape}
              <text
                x={it.x}
                y={it.y + 4}
                textAnchor="middle"
                fill={labelColor}
                fontSize={it.type === "table" || it.type === "seat" || it.type === "booth" ? 11 : 10}
                fontWeight="700"
                pointerEvents="none"
              >
                {it.label}
              </text>
              {it.zone === "VIP" && (it.type === "table" || it.type === "booth") && (
                <text x={it.x} y={it.y + 16} textAnchor="middle" fill="oklch(0.82 0.15 85)" fontSize="7" pointerEvents="none">
                  VIP
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function MapLegend() {
  const dot = (color: string) => (
    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
  );
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">{dot("oklch(0.78 0.18 220)")} Disponible</span>
      <span className="flex items-center gap-1.5">{dot("oklch(0.66 0.27 0)")} Seleccionada</span>
      <span className="flex items-center gap-1.5">{dot("oklch(0.6 0.02 280)")} Reservada</span>
      <span className="flex items-center gap-1.5">{dot("oklch(0.65 0.24 25)")} Ocupada</span>
      <span className="flex items-center gap-1.5">{dot("oklch(0.82 0.15 85)")} VIP</span>
    </div>
  );
}
