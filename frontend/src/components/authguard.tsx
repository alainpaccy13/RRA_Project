"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("staff_token"); 
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.replace("/staff-login");
    }
  }, [router]);

  if (isAuthenticated === null) {
  return <div className="h-screen flex items-center justify-center">Loading...</div>;
}

if (!isAuthenticated) {
  // still redirecting
  return null;
}

return <>{children}</>;
}
