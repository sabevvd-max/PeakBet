"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatCoins, cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  balance: number;
  level: number;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [query, setQuery] = useState("");
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});

  function load() {
    fetch(`/api/admin/users?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));
  }

  useEffect(load, [query]);

  async function patchUser(userId: string, body: object) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...body }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    toast.success("Updated");
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Users &amp; Balances</h1>

      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by username or email..." className="mb-4 max-w-sm" />

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-peak-border text-left text-xs text-peak-gray">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Adjust Balance</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-b border-peak-border/50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar username={u.username} avatarUrl={u.avatarUrl} size="sm" />
                    <div>
                      <p className="font-medium text-white">{u.username}</p>
                      <p className="text-xs text-peak-gray-dim">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-peak-gold">{formatCoins(u.balance)}</td>
                <td className="px-4 py-3 text-peak-gray">{u.level}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "ADMIN" ? "neon" : "gray"}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  {u.isBanned ? <Badge variant="red">Banned</Badge> : <Badge variant="gray">Active</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={adjustments[u.id] ?? ""}
                      onChange={(e) => setAdjustments((a) => ({ ...a, [u.id]: e.target.value }))}
                      placeholder="±amount"
                      className="h-8 w-24 rounded-lg border border-peak-border bg-peak-surface px-2 text-xs text-white"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const amount = Number(adjustments[u.id]);
                        if (!amount) return;
                        patchUser(u.id, { balanceAdjustment: amount });
                        setAdjustments((a) => ({ ...a, [u.id]: "" }));
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <Button size="sm" variant={u.isBanned ? "neon" : "danger"} onClick={() => patchUser(u.id, { isBanned: !u.isBanned })}>
                      {u.isBanned ? "Unban" : "Ban"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => patchUser(u.id, { role: u.role === "ADMIN" ? "USER" : "ADMIN" })}>
                      {u.role === "ADMIN" ? "Demote" : "Promote"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users === null && <p className="p-8 text-center text-sm text-peak-gray">Loading…</p>}
        {users?.length === 0 && <p className="p-8 text-center text-sm text-peak-gray">No users found.</p>}
      </GlassCard>
    </div>
  );
}
