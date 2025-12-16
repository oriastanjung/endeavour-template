"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    return router.replace("/");
  }

  return <>{children}</>;
}

export default AuthLayout;
