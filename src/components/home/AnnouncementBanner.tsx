"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
}

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        if (d.announcement && localStorage.getItem("peakbet-dismissed-announcement") !== d.announcement.id) {
          setAnnouncement(d.announcement);
        }
      });
  }, []);

  if (!announcement || dismissed) return null;

  function dismiss() {
    if (announcement) localStorage.setItem("peakbet-dismissed-announcement", announcement.id);
    setDismissed(true);
  }

  return (
    <div className="border-b border-peak-gold/20 bg-peak-gold/5">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 lg:px-8">
        <Megaphone className="h-4 w-4 shrink-0 text-peak-gold" />
        <p className="min-w-0 flex-1 truncate text-sm text-white">
          <span className="font-semibold text-peak-gold">{announcement.title}</span> — {announcement.body}
        </p>
        <button onClick={dismiss} className="shrink-0 text-peak-gray hover:text-white cursor-pointer" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
