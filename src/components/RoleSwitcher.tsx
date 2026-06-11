import { useStore, type Role } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { User, Building2, Shield } from "lucide-react";

const roles: { id: Role; label: string; icon: typeof User; to: string }[] = [
  { id: "user", label: "Usuario", icon: User, to: "/" },
  { id: "owner", label: "Propietario", icon: Building2, to: "/owner/dashboard" },
  { id: "staff", label: "Staff", icon: Shield, to: "/staff/check-in" },
];

export function RoleSwitcher() {
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
      {roles.map((r) => {
        const active = role === r.id;
        const Icon = r.icon;
        return (
          <button
            key={r.id}
            onClick={() => {
              setRole(r.id);
              navigate({ to: r.to });
            }}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
              active ? "gradient-primary text-white" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-3 w-3" />
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
