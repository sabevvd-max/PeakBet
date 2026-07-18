"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--peak-surface-2)",
            border: "1px solid var(--peak-border)",
            color: "var(--foreground)",
          },
        }}
      />
    </AuthProvider>
  );
}
