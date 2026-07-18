import { Link } from "@tanstack/react-router";
import { Calculator, Clock, Settings } from "lucide-react";

const items = [
  { to: "/", label: "仕入れ", icon: Calculator, exact: true },
  { to: "/history", label: "履歴", icon: Clock, exact: false },
  { to: "/settings", label: "設定", icon: Settings, exact: false },
] as const;

export function TabBar() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl safe-bottom"
      aria-label="Primary"
    >
      <div className="mx-auto max-w-[440px] px-2 pt-1.5">
        <ul className="grid grid-cols-3">
          {items.map(({ to, label, icon: Icon, exact }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact }}
                className="group flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-muted-foreground data-[status=active]:text-foreground transition-colors"
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
                <span className="mt-0.5 h-[3px] w-6 rounded-full bg-transparent group-data-[status=active]:bg-accent" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
