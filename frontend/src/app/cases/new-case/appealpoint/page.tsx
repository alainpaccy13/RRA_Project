"use client";
import Sidebar from "@/components/sidebar";
import { AppealPointForm } from "@/components/appealpoint";
import AuthGuard from "@/components/authguard";

export default function AppealPointPage() {

  return (
    <AuthGuard>
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1">
        <Sidebar/>
        <div className=" w-full px-16 bg-[#F9FAFB]">
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Details
            </h1>
        <p className="text-lg text-gray-500 mb-12">
            provide appeal point details
        </p>
           <AppealPointForm/>
        </div>
      </main>
    
    </div>
    </AuthGuard>
  );
}
