"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);

  function handleClick(key: string) {
    setActive(key);
    onChange?.(key);
  }

  return (
    <div className={cn("flex items-center gap-1 overflow-x-auto rounded-xl border border-peak-border bg-peak-surface p-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => handleClick(tab.key)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all cursor-pointer",
            active === tab.key ? "bg-peak-gold text-peak-black" : "text-peak-gray hover:bg-white/5 hover:text-white"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
