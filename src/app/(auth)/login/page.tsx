"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });

    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
      return;
    }

    toast.success("Welcome back!");
    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to keep spinning."
      footer={
        <>
          New to PeakBet?{" "}
          <Link href="/signup" className="font-semibold text-peak-gold hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            icon={<Lock className="h-4 w-4" />}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[38px] text-peak-gray hover:text-white cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-medium text-peak-gold hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </AuthCard>
  );
}
