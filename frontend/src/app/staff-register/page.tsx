"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as Select from "@radix-ui/react-select";
import api from "@/lib/api"; 


export default function StaffRegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    committeeRole: "",
    committeeGroup: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  console.log(api);
  

  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load remembered credentials
  useEffect(() => {
    const remembered = localStorage.getItem("staff_register_remember");
    if (remembered) {
      const savedData = JSON.parse(remembered);
      setFormData((prev) => ({
        ...prev,
        email: savedData.email || "",
        password: savedData.password || "",
      }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleCommitteeRoleChange = (value: string) => {
  setFormData((prev) => ({ ...prev, committeeRole: value }));
};

  const handleCommitteeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, committeeGroup: value }));
  };

  // Password validation
  const passwordChecks = {
    length: formData.password.length >= 8,
    letter: /[A-Za-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    symbol: /[^A-Za-z0-9]/.test(formData.password),
  };

  const isValidPassword =
    passwordChecks.length &&
    passwordChecks.letter &&
    passwordChecks.number &&
    passwordChecks.symbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!isValidPassword) {
      setErrorMsg(
        "Password must be at least 8 characters, include letters, numbers, and symbols."
      );
      return;
    }

    // Handle Remember Me storage
    if (rememberMe) {
      localStorage.setItem(
        "staff_register_remember",
        JSON.stringify({ email: formData.email, password: formData.password })
      );
    } else {
      localStorage.removeItem("staff_register_remember");
    }

      try {
        setLoading(true);
        const res = await api.post("/api/v1/auth/register", formData);
        console.log(api);
        
        setSuccessMsg(res.data.message || "Registration successful!");
        setErrorMsg("");
        setLoading(false);
        router.push("/cases");

      } catch (error: any) {
        if (error.response && error.response.data) {
          setErrorMsg(error.response.data.message || "Something went wrong.");
        } else {
          setErrorMsg(error.message || "Something went wrong.");
        }
        setLoading(false);
      }
    };

  return (
    <div className="flex min-h-screen">
      {/* Left side */}
      <div className="flex w-1/2 flex-col items-center justify-center px-10">
        <div className="flex flex-row items-center">
          <img src="/Rralogo.png" alt="Logo" className="h-14 w-auto" />
          <h1 className="text-2xl font-bold text-[#1d3557] ml-2">
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

        <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
          <div>
            <label>Full names</label>
            <Input
              id="fullName"
              placeholder="Full names"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Title</label>
            <Input
              id="title"
              placeholder="type your title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <Select.Root value={formData.committeeRole} onValueChange={handleCommitteeRoleChange}>
              <Select.Trigger
                className="h-8 w-full bg-white border border-gray-300 rounded px-3 flex items-center justify-between"
                aria-label="Role"
              >
                <Select.Value placeholder="Choose your Role" />
              </Select.Trigger>
              <Select.Content className="bg-white border border-gray-300 rounded mt-1">
                <Select.Viewport>
                  <Select.Item
                    value="COMMITTEE_LEADER"
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Select.ItemText>COMMITTEE LEADER</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="COMMITTEE_MEMBER"
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Select.ItemText>
                      COMMITTEE MEMBER
                    </Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="COMMITTEE_MEMBER_T3_TAM"
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Select.ItemText>
                      COMMITTEE MEMBER T3 TAM
                    </Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Root>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Committee group
            </label>
            <Select.Root
              value={formData.committeeGroup}
              onValueChange={handleCommitteeChange}
            >
              <Select.Trigger
                className="h-8 w-full bg-white border border-gray-300 rounded px-3 flex items-center justify-between"
                aria-label="Committee group"
              >
                <Select.Value placeholder="choose your group" />
              </Select.Trigger>
              <Select.Content className="bg-white border border-gray-300 rounded mt-1">
                <Select.Viewport>
                  <Select.Item
                    value="APPEAL_COMMITTEE"
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Select.ItemText>Appeal Committee</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="AMICABLE_SETTLEMENT_COMMITTEE"
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Select.ItemText>Amicable Settlement Committee</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Root>
          </div>

          <div>
            <label>Staff email</label>
            <Input
              id="email"
              type="email"
              placeholder="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Phone</label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Phone"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <Input
              id="password"
              type="password"
              placeholder="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#18668D] w-4 h-4"
              />
              <span>Remember Me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm text-[#18668D] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
          {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

          <Button
            type="submit"
            className="w-full bg-[#18668D] hover:bg-[#134d66]"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mb-3">
          Have an account?{" "}
          <Link href="/staff-login" className="text-[#18668D]">
            Login
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
            Empowering automation tools for seamless tax claim processing and
            management.
          </p>
        </div>
      </div>
    </div>
  );
}
