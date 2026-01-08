"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Get the stored role from localStorage
    const userRole = localStorage.getItem("staff_role");

    if (userRole === "COMMITTEE_LEADER") {
      setIsAuthorized(true);
    } else {
      // If the role is incorrect or doesn't exist, redirect
      setIsAuthorized(false);
      router.replace("/cases"); 
    }
  }, [router]);

  if (isAuthorized === null) {
    return <div className="h-screen flex items-center justify-center">Verifying access...</div>;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return null;
}