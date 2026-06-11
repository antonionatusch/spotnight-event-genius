import { create } from "zustand";

export type Role = "user" | "owner" | "staff";
export type Floor = "planta_baja" | "planta_alta";
export type SeatStatus = "available" | "selected" | "reserved" | "occupied";
export type TicketKind = "General" | "VIP" | "Mesa" | "Silla";

export type VenueMapItem = {
  id: string;
  label: string;
  floor: Floor;
  type: "table" | "seat" | "booth" | "bar" | "stage" | "bathroom" | "entrance" | "dance_floor" | "stairs" | "area";
  zone: "General" | "VIP" | "Mesa" | "Barra" | "Pista" | "Servicio";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  capacity?: number;
  price?: number;
  status?: SeatStatus;
};

export type TicketType = {
  id: string;
  name: TicketKind;
  price: number;
  capacity: number;
  available: number;
};

export type EventItem = {
  id: string;
  name: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  imageUrl: string;
  status: "active" | "draft" | "sold_out";
  ticketTypes: TicketType[];
  isFeatured?: boolean;
  hot?: boolean;
  rating?: number;
  attendees?: number;
};

export type Reservation = {
  id: string;
  code: string;
  eventId: string;
  eventName: string;
  venueName: string;
  userName: string;
  ticketType: TicketKind;
  peopleCount: number;
  totalAmount: number;
  spotNightCommission: number;
  status: "Confirmada" | "Ingresó" | "Cancelada";
  venueMapItemId?: string;
  venueMapItemLabel?: string;
  zone?: string;
  floor?: Floor;
  createdAt: string;
  checkedInAt?: string;
};

// -------- Mock events --------
const events: EventItem[] = [
  {
    id: "e1",
    name: "La Tuti Viruli",
    venueName: "SpotNight Club",
    date: "Sáb 14 Jun",
    startTime: "23:00",
    endTime: "04:00",
    location: "Equipetrol",
    description:
      "Una noche única con los mejores DJs de la escena. Ambiente exclusivo, cócteles premium y la pista más encendida de la ciudad. Reservá tu lugar antes de llegar.",
    imageUrl:
      "https://images.unsplash.com/photo-1571266028243-d220bc562b09?w=1200&q=80",
    status: "active",
    isFeatured: true,
    hot: true,
    rating: 4.9,
    attendees: 200,
    ticketTypes: [
      { id: "t1", name: "General", price: 150, capacity: 200, available: 120 },
      { id: "t2", name: "Mesa", price: 250, capacity: 12, available: 7 },
      { id: "t3", name: "Silla", price: 180, capacity: 20, available: 14 },
      { id: "t4", name: "VIP", price: 700, capacity: 9, available: 5 },
    ],
  },
  {
    id: "e2",
    name: "Noche Latina XL",
    venueName: "Club Euphoria",
    date: "Vie 13 Jun",
    startTime: "22:00",
    endTime: "04:00",
    location: "Equipetrol",
    description: "La mejor noche latina con ritmos urbanos y reggaeton.",
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
    status: "active",
    ticketTypes: [
      { id: "t1", name: "General", price: 80, capacity: 300, available: 180 },
      { id: "t2", name: "Mesa", price: 500, capacity: 10, available: 6 },
    ],
  },
  {
    id: "e3",
    name: "Electro Night",
    venueName: "The Vault",
    date: "Dom 15 Jun",
    startTime: "00:00",
    endTime: "06:00",
    location: "Urubó",
    description: "Electro y techno con los mejores DJs internacionales.",
    imageUrl:
      "https://images.unsplash.com/photo-1574391884720-bbc049ec09ad?w=1200&q=80",
    status: "active",
    ticketTypes: [
      { id: "t1", name: "General", price: 100, capacity: 250, available: 100 },
      { id: "t2", name: "VIP", price: 200, capacity: 20, available: 8 },
    ],
  },
  {
    id: "e4",
    name: "Reggaeton Boom",
    venueName: "Arena Club",
    date: "Sáb 21 Jun",
    startTime: "21:30",
    endTime: "04:00",
    location: "Las Palmas",
    description: "Reggaeton sin parar toda la noche.",
    imageUrl:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80",
    status: "active",
    ticketTypes: [
      { id: "t1", name: "General", price: 60, capacity: 400, available: 220 },
    ],
  },
];

// -------- Mock venue map (La Tuti Viruli) --------
// SVG canvas 400 x 540
const venueMap: VenueMapItem[] = [
  // ===== Planta Baja =====
  // Structural
  { id: "PB-STG", label: "DJ STAGE", floor: "planta_baja", type: "stage", zone: "Servicio", x: 200, y: 60, width: 160, height: 36 },
  { id: "PB-BAR", label: "BAR", floor: "planta_baja", type: "bar", zone: "Barra", x: 360, y: 200, width: 50, height: 130 },
  { id: "PB-PISTA", label: "PISTA", floor: "planta_baja", type: "dance_floor", zone: "Pista", x: 200, y: 280, width: 200, height: 160 },
  { id: "PB-BAN", label: "BAÑOS", floor: "planta_baja", type: "bathroom", zone: "Servicio", x: 60, y: 470, width: 60, height: 30 },
  { id: "PB-ENT", label: "↑ ENTRADA", floor: "planta_baja", type: "entrance", zone: "Servicio", x: 230, y: 490, width: 140, height: 30 },

  // Mesas izquierda
  { id: "PB-M01", label: "M01", floor: "planta_baja", type: "table", zone: "General", x: 70, y: 170, width: 50, height: 36, capacity: 4, price: 250, status: "available" },
  { id: "PB-M02", label: "M02", floor: "planta_baja", type: "table", zone: "General", x: 70, y: 230, width: 50, height: 36, capacity: 4, price: 250, status: "reserved" },
  { id: "PB-M03", label: "M03", floor: "planta_baja", type: "table", zone: "General", x: 70, y: 290, width: 50, height: 36, capacity: 4, price: 250, status: "available" },
  { id: "PB-M04", label: "M04", floor: "planta_baja", type: "table", zone: "General", x: 70, y: 380, width: 50, height: 36, capacity: 4, price: 250, status: "occupied" },

  // Mesas centro (alrededor de la pista, sin pisarla)
  { id: "PB-M05", label: "M05", floor: "planta_baja", type: "table", zone: "General", x: 155, y: 140, radius: 22, capacity: 4, price: 280, status: "available" },
  { id: "PB-M06", label: "M06", floor: "planta_baja", type: "table", zone: "General", x: 175, y: 405, radius: 22, capacity: 4, price: 280, status: "available" },
  { id: "PB-M07", label: "M07", floor: "planta_baja", type: "table", zone: "General", x: 245, y: 140, radius: 22, capacity: 4, price: 280, status: "reserved" },
  { id: "PB-M08", label: "M08", floor: "planta_baja", type: "table", zone: "General", x: 265, y: 405, radius: 22, capacity: 4, price: 280, status: "available" },

  // Mesas junto a la barra (no encima)
  { id: "PB-M09", label: "M09", floor: "planta_baja", type: "seat", zone: "Barra", x: 315, y: 160, width: 36, height: 32, capacity: 2, price: 180, status: "available" },
  { id: "PB-M10", label: "M10", floor: "planta_baja", type: "seat", zone: "Barra", x: 315, y: 210, width: 36, height: 32, capacity: 2, price: 180, status: "occupied" },
  { id: "PB-M11", label: "M11", floor: "planta_baja", type: "seat", zone: "General", x: 370, y: 350, width: 36, height: 32, capacity: 2, price: 180, status: "available" },
  { id: "PB-M12", label: "M12", floor: "planta_baja", type: "seat", zone: "General", x: 370, y: 400, width: 36, height: 32, capacity: 2, price: 180, status: "reserved" },

  // ===== Planta Alta (VIP) =====
  { id: "PA-TIT", label: "✦ PLANTA VIP ✦", floor: "planta_alta", type: "area", zone: "VIP", x: 200, y: 50, width: 220, height: 30 },
  { id: "PA-BAR", label: "BAR VIP", floor: "planta_alta", type: "bar", zone: "Barra", x: 350, y: 200, width: 60, height: 110 },
  { id: "PA-AREA", label: "ÁREA VIP", floor: "planta_alta", type: "area", zone: "VIP", x: 200, y: 280, width: 200, height: 170 },
  { id: "PA-STAIRS", label: "ESCALERA", floor: "planta_alta", type: "stairs", zone: "Servicio", x: 350, y: 410, width: 50, height: 50 },

  { id: "PA-V01", label: "V01", floor: "planta_alta", type: "table", zone: "VIP", x: 130, y: 130, width: 60, height: 50, capacity: 6, price: 700, status: "available" },
  { id: "PA-V02", label: "V02", floor: "planta_alta", type: "table", zone: "VIP", x: 220, y: 130, width: 60, height: 50, capacity: 6, price: 700, status: "available" },
  { id: "PA-V03", label: "V03", floor: "planta_alta", type: "table", zone: "VIP", x: 60, y: 230, width: 55, height: 45, capacity: 4, price: 600, status: "reserved" },
  { id: "PA-V04", label: "V04", floor: "planta_alta", type: "table", zone: "VIP", x: 60, y: 320, width: 55, height: 45, capacity: 4, price: 600, status: "available" },
  { id: "PA-V05", label: "V05", floor: "planta_alta", type: "table", zone: "VIP", x: 200, y: 250, width: 60, height: 50, capacity: 6, price: 750, status: "available" },
  { id: "PA-V06", label: "V06", floor: "planta_alta", type: "booth", zone: "VIP", x: 200, y: 360, width: 90, height: 55, capacity: 8, price: 900, status: "occupied" },
  { id: "PA-V07", label: "V07", floor: "planta_alta", type: "table", zone: "VIP", x: 70, y: 440, width: 55, height: 45, capacity: 4, price: 650, status: "available" },
  { id: "PA-V08", label: "V08", floor: "planta_alta", type: "table", zone: "VIP", x: 200, y: 460, width: 60, height: 45, capacity: 6, price: 750, status: "reserved" },
  { id: "PA-V09", label: "V09", floor: "planta_alta", type: "table", zone: "VIP", x: 310, y: 440, width: 55, height: 45, capacity: 4, price: 650, status: "available" },
];

// -------- Mock reservations (seed) --------
const seedReservations: Reservation[] = [
  {
    id: "r1", code: "SN-001", eventId: "e1", eventName: "La Tuti Viruli", venueName: "SpotNight Club",
    userName: "Ana López", ticketType: "Mesa", peopleCount: 4, totalAmount: 250, spotNightCommission: 25,
    status: "Confirmada", venueMapItemId: "PB-M02", venueMapItemLabel: "M02", zone: "General", floor: "planta_baja",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r2", code: "SN-002", eventId: "e1", eventName: "La Tuti Viruli", venueName: "SpotNight Club",
    userName: "Bruno Pérez", ticketType: "General", peopleCount: 2, totalAmount: 300, spotNightCommission: 30,
    status: "Ingresó", createdAt: new Date().toISOString(), checkedInAt: new Date().toISOString(),
  },
  {
    id: "r3", code: "SN-003", eventId: "e1", eventName: "La Tuti Viruli", venueName: "SpotNight Club",
    userName: "Carla Vega", ticketType: "VIP", peopleCount: 6, totalAmount: 700, spotNightCommission: 70,
    status: "Confirmada", venueMapItemId: "PA-V01", venueMapItemLabel: "V01", zone: "VIP", floor: "planta_alta",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r4", code: "SN-004", eventId: "e1", eventName: "La Tuti Viruli", venueName: "SpotNight Club",
    userName: "Carlos Mendoza", ticketType: "Mesa", peopleCount: 6, totalAmount: 250, spotNightCommission: 25,
    status: "Confirmada", venueMapItemId: "PB-M06", venueMapItemLabel: "M06", zone: "General", floor: "planta_baja",
    createdAt: new Date().toISOString(),
  },
];

type Store = {
  role: Role;
  setRole: (r: Role) => void;
  events: EventItem[];
  venueMap: VenueMapItem[];
  reservations: Reservation[];
  addEvent: (e: EventItem) => void;
  addReservation: (r: Omit<Reservation, "id" | "code" | "createdAt">) => Reservation;
  markReserved: (itemId: string) => void;
  checkIn: (code: string) => { ok: boolean; message: string; reservation?: Reservation };
};

export const useStore = create<Store>((set, get) => ({
  role: "user",
  setRole: (r) => set({ role: r }),
  events,
  venueMap,
  reservations: seedReservations,
  addEvent: (e) => set((s) => ({ events: [e, ...s.events] })),
  addReservation: (r) => {
    const code = `SN-${String(get().reservations.length + 1).padStart(3, "0")}`;
    const newR: Reservation = { ...r, id: crypto.randomUUID(), code, createdAt: new Date().toISOString() };
    set((s) => ({ reservations: [newR, ...s.reservations] }));
    if (r.venueMapItemId) get().markReserved(r.venueMapItemId);
    return newR;
  },
  markReserved: (itemId) =>
    set((s) => ({
      venueMap: s.venueMap.map((i) => (i.id === itemId ? { ...i, status: "reserved" } : i)),
    })),
  checkIn: (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    const reservation = get().reservations.find((r) => r.code.toUpperCase() === code);
    if (!reservation) return { ok: false, message: "Código inválido" };
    if (reservation.status === "Ingresó") return { ok: false, message: "Reserva ya utilizada", reservation };
    if (reservation.status === "Cancelada") return { ok: false, message: "Reserva cancelada", reservation };
    set((s) => ({
      reservations: s.reservations.map((r) =>
        r.id === reservation.id ? { ...r, status: "Ingresó", checkedInAt: new Date().toISOString() } : r,
      ),
    }));
    return { ok: true, message: "Ingreso registrado", reservation: { ...reservation, status: "Ingresó" } };
  },
}));
