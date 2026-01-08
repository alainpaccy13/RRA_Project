"use client";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { TaxForm } from "@/components/taxForm";
import YourCasesPage from "@/components/yourcases";
import ProfilePage from "@/components/profile";
import AuthGuard from "@/components/authguard";

export default function AllCasesPage() {

  return (
    <AuthGuard>
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1">
        <Sidebar/>
        <div className=" w-full px-16 bg-[#F9FAFB]">
          <ProfilePage/>
        </div>
      </main>
    
    </div>
    </AuthGuard>
  );
}
