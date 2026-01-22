"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.clear();
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center text-lg">
      Logging out...
    </div>
  );
}
