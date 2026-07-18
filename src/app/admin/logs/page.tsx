"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface Log {
  id: string;
  admin: string;
  action: string;
  target: string | null;
  meta: unknown;
  createdAt: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/logs").then((r) => r.json()).then((d) => setLogs(d.logs ?? []));
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Admin Logs</h1>

      <GlassCard className="divide-y divide-peak-border/50">
        {logs === null ? (
          <p className="p-8 text-center text-sm text-peak-gray">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-sm text-peak-gray">No admin actions logged yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="px-4 py-3">
              <p className="text-sm text-white">
                <span className="font-semibold text-peak-neon">{log.admin}</span> — {log.action.replace(/_/g, " ")}
                {log.target && <span className="text-peak-gray"> ({log.target})</span>}
              </p>
              {log.meta ? <p className="mt-0.5 text-xs text-peak-gray-dim">{JSON.stringify(log.meta)}</p> : null}
              <p className="text-[11px] text-peak-gray-dim">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </GlassCard>
    </div>
  );
}
