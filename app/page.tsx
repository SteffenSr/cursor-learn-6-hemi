"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { isAuthenticated, loaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loaded) {
      router.replace(isAuthenticated ? "/overview" : "/login");
    }
  }, [loaded, isAuthenticated, router]);

  return null;
}
