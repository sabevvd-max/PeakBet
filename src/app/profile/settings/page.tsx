"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/profile/RequireAuth";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useUIStore } from "@/store/uiStore";
import { createClient } from "@/lib/supabase/client";

function SettingsContent() {
  const { profile, refreshProfile, signOut } = useAuth();
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const toggleSound = useUIStore((s) => s.toggleSound);

  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  async function saveProfile() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, bio, avatarUrl }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return toast.error(data.error ?? "Could not save");
    toast.success("Profile updated");
    refreshProfile();
  }

  async function changePassword() {
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters");
    setChangingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) return toast.error(error.message);
    setNewPassword("");
    toast.success("Password updated");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">My Profile</h1>
      <ProfileNav />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Profile Details</h2>
          <div className="mb-4 flex items-center gap-4">
            <Avatar username={username} avatarUrl={avatarUrl} size="lg" />
          </div>
          <div className="space-y-4">
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-peak-gray">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                className="w-full rounded-xl border border-peak-border bg-peak-surface px-3.5 py-2.5 text-sm text-white placeholder:text-peak-gray-dim focus:border-peak-gold/50 focus:outline-none"
              />
            </div>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-6">
          <GlassCard className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Security</h2>
            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            <Button className="mt-3" onClick={changePassword} disabled={changingPassword}>
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Preferences</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-peak-gray">Sound Effects</span>
              <Button variant={soundEnabled ? "primary" : "secondary"} size="sm" onClick={toggleSound}>
                {soundEnabled ? "On" : "Off"}
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="mb-2 text-lg font-semibold text-white">Account</h2>
            <p className="mb-3 text-sm text-peak-gray">{profile?.email}</p>
            <Button variant="danger" onClick={signOut}>
              Log Out
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}
