import { Link, useLocation } from "@tanstack/react-router";
import { Compass, MapPin, Calendar, Ticket, ShieldCheck } from "lucide-react";

const items = [
  { to: "/", label: "Explorar", icon: Compass },
  { to: "/map", label: "Mapa", icon: MapPin },
  { to: "/my-reservations", label: "Reservas", icon: Calendar },
  { to: "/my-qr", label: "Mi QR", icon: Ticket },
  { to: "/staff/check-in", label: "Control", icon: ShieldCheck },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 px-2 py-1.5 text-[11px]"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  active ? "gradient-primary text-white glow-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className={active ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
