"use client";

import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { log } from "console";


export default function StaffLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
    

  // Load remembered credentials
  useEffect(() => {
    const remembered = localStorage.getItem("staff_login_remember");
    if (remembered) {
      const savedData = JSON.parse(remembered);
      setEmail(savedData.email || "");
      setPassword(savedData.password || "");
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
  const res = await api.post("/api/v1/auth/login", { email, password });
  console.log(api);
  

  // Save token if returned
  if (res.data.accessToken) {
    localStorage.setItem("staff_token", res.data.accessToken);
  }

  if (res.data.refreshToken) { 
    localStorage.setItem("staff_refresh_token", res.data.refreshToken); 
  }
  

  if (res.data.fullNames) localStorage.setItem("staff_name", res.data.fullNames);
  if (res.data.id) {
  localStorage.setItem("staff_id", res.data.id);
  }
  if (res.data.role) {
      localStorage.setItem("staff_role", res.data.role); 
    }

  
  if (rememberMe) {
    localStorage.setItem(
      "staff_login_remember",
      JSON.stringify({ email, password })
    );
  } else {
    localStorage.removeItem("staff_login_remember");
  }

  if (res.data.role === "COMMITTEE_LEADER") {
    router.push("/admin");
  } else {
    router.push("/cases");
  }

  if (res.data.isProxy) {
    localStorage.setItem("staff_is_proxy", "true");
} else {
    localStorage.removeItem("staff_is_proxy");
}


} catch (error: any) {
  if (error.response && error.response.data) {
    setErrorMsg(error.response.data.message || "Login failed.");
  } else {
    setErrorMsg(error.message || "Login failed.");
  }
} finally {
  setLoading(false);
}
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side */}
      <div className="flex w-1/2 flex-col items-center justify-center px-10">
        {/* Logo */}
        <div className="flex flex-row items-center">
          <img src="/Rralogo.png" alt="Logo" className="h-14 w-auto"/>
          <h1 className="text-2xl font-bold text-[#1d3557]">
            Tax Claim Management System
          </h1>
        </div>

        <div className="flex space-x-2 mb-4">
          <div className="h-[6px] w-40 rounded-full bg-[#338ABE]" />
          <div className="h-[6px] w-24 rounded-full bg-[#F8BD00]" />
          <div className="h-[6px] w-12 rounded-full bg-[#319F43]" />
        </div>

        <h2 className="text-2xl font-semibold mb-1">Welcome back</h2>
        <p className="text-lg font-semibold text-gray-500 mb-6">staff portal</p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Staff email
            </label>
            <Input
              type="email"
              placeholder="email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setRememberMe(checked === true)
                }
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link href="/forgot-password" className="text-[#18668D] underline">
              Forgot password
            </Link>
          </div>

          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

          <Button
            type="submit"
            className="w-full bg-[#18668D] hover:bg-[#134d66]"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <Link href="/staff-register" className="text-[#18668D]">
            Register
          </Link>
        </p>
      </div>

      {/* Right side */}
      <div className="w-1/2 bg-[#1b4965] text-white flex flex-col justify-center items-center px-12 relative">
        <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#338ABE]" />
        <div className="absolute left-[6px] top-0 bottom-0 w-[6px] bg-[#F8BD00]" />
        <div className="absolute left-[12px] top-0 bottom-0 w-[6px] bg-[#319F43]" />

        <div className="max-w-md text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/Rralogo.png"
              alt="Logo"
              className="h-20 w-20 p-2 rounded-full bg-white"
            />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Efficient Tax Administration Starts Here
          </h2>
          <p className="text-gray-200">
            Empowering Automation tools for seamless tax claim processing and
            management.
          </p>
        </div>
      </div>
    </div>
  );
}
