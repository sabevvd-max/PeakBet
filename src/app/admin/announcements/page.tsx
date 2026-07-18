"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Announcement {
  id: string;
  title: string;
  body: string;
  active: boolean;
  author: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [creating, setCreating] = useState(false);

  function load() {
    fetch("/api/admin/announcements").then((r) => r.json()).then((d) => setAnnouncements(d.announcements ?? []));
  }
  useEffect(load, []);

  async function create() {
    if (!title.trim() || !body.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setCreating(false);
    if (!res.ok) return toast.error("Failed to create announcement");
    setTitle("");
    setBody("");
    toast.success("Announcement created");
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch("/api/admin/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Announcements</h1>

      <GlassCard className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">New Announcement</h2>
        <div className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Message shown to all players"
            className="w-full rounded-xl border border-peak-border bg-peak-surface px-3.5 py-2.5 text-sm text-white placeholder:text-peak-gray-dim focus:border-peak-gold/50 focus:outline-none"
          />
          <Button onClick={create} disabled={creating}>
            Publish
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="divide-y divide-peak-border/50">
        {(announcements ?? []).map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{a.title}</p>
                {a.active ? <Badge variant="neon">Live</Badge> : <Badge variant="gray">Hidden</Badge>}
              </div>
              <p className="mt-1 text-sm text-peak-gray">{a.body}</p>
              <p className="mt-1 text-[11px] text-peak-gray-dim">
                by {a.author} · {new Date(a.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => toggleActive(a.id, !a.active)}>
                {a.active ? "Hide" : "Show"}
              </Button>
              <Button size="sm" variant="danger" onClick={() => remove(a.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {announcements?.length === 0 && <p className="p-8 text-center text-sm text-peak-gray">No announcements yet.</p>}
      </GlassCard>
    </div>
  );
}
