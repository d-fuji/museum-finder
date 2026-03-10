"use client";

import { List, Map } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "map";

type Props = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

const ITEMS: { mode: ViewMode; icon: typeof List; label: string }[] = [
  { mode: "list", icon: List, label: "リスト表示" },
  { mode: "map", icon: Map, label: "地図表示" },
];

export function ViewToggle({ value, onChange }: Props) {
  return (
    <div
      className="inline-flex items-center rounded-lg bg-muted p-1"
      role="group"
      aria-label="表示切替"
    >
      {ITEMS.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-md p-2 transition-colors",
            value === mode
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onChange(mode)}
          aria-label={label}
          aria-pressed={value === mode}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
