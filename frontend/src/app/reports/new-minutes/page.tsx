"use client";

import Sidebar from "@/components/sidebar";
import { MinutesForm } from "@/components/minutesform";
import AuthGuard from "@/components/authguard";

export default function CasesPage() {

  return (
    <AuthGuard>
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1">
        <Sidebar/>
        <div className=" w-full px-16 bg-[#F9FAFB]">
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">
                        Meeting Minutes
                    </h1>
                <p className="text-lg text-gray-500 mb-12">
                    Fill out the  form bellow to generate a meeting minutes
                </p>
                <MinutesForm/>
                </div>
      </main>
    
    </div>
    </AuthGuard>
  );
}
