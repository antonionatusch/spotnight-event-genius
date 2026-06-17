import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";

export function AppHeader({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-1.5">
          <span className="text-white text-lg font-bold tracking-tight">
            {title ?? "SpotNight"}
          </span>
        </Link>
        <RoleSwitcher />
      </div>
    </header>
  );
}
