"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { PageLoader } from "@/components/ui/Skeleton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading) return <PageLoader />;
  if (!user || !isAdmin) return <PageLoader />;

  return <>{children}</>;
}
