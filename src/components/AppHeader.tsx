import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";

export function AppHeader({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary glow-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="text-gradient text-lg font-bold tracking-tight">
            {title ?? "SpotNight"}
          </span>
        </Link>
        <RoleSwitcher />
      </div>
    </header>
  );
}
