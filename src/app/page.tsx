"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui";
import { routes } from "@/lib/routes";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(routes.login);
  }, [router]);
  return <LoadingState label="Opening MedBridge" />;
}
