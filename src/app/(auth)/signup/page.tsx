"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validation/auth";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { username: values.username },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session) {
      toast.success("Welcome to PeakBet! 10,000 demo coins added.");
      router.push("/");
      router.refresh();
    } else {
      setPendingConfirmation(true);
    }
  }

  if (pendingConfirmation) {
    return (
      <AuthCard title="Check your inbox" subtitle="Confirm your email to activate your PeakBet account.">
        <p className="text-sm text-peak-gray">
          We sent a confirmation link to your email address. Once confirmed, you can log in and claim your{" "}
          <span className="font-semibold text-peak-gold">10,000 demo coins</span>.
        </p>
        <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
          Go to Log In
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up free and get 10,000 demo coins instantly."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-peak-gold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Username" icon={<UserIcon className="h-4 w-4" />} placeholder="highroller" error={errors.username?.message} {...register("username")} />
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
        <Input
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          icon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <label className="flex items-start gap-2 text-xs text-peak-gray">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-peak-border bg-peak-surface accent-peak-gold" {...register("agreeToTerms")} />
          I understand PeakBet uses virtual demo coins only, with no real-money value.
        </label>
        {errors.agreeToTerms && <p className="text-xs text-peak-red">{errors.agreeToTerms.message}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
    </AuthCard>
  );
}
