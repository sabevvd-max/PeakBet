"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordInput) {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    toast.success("Password updated!");
  }

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="You can now log in with your new password.">
        <Button className="w-full" onClick={() => router.push("/login")}>
          Go to Log In
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a strong password for your account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="New Password" type="password" icon={<Lock className="h-4 w-4" />} placeholder="••••••••" error={errors.password?.message} {...register("password")} />
        <Input
          label="Confirm New Password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </AuthCard>
  );
}
