"use client";
import Sidebar from "@/components/sidebar";
import CasesPage from "@/components/cases";
import AuthGuard from "@/components/authguard";

export default function MeetingsPage() {

  return (
    <AuthGuard>
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1">
        <Sidebar/>
        <div className=" w-full px-16 bg-[#F9FAFB]">
         <CasesPage/>
        </div>
      </main>
    
    </div>
    </AuthGuard>
  );
}
