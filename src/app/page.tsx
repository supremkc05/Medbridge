"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui";
import { routes } from "@/lib/routes";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(routes.patients);
  }, [router]);
  return <LoadingState label="Opening patients" />;
}
