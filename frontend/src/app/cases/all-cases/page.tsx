"use client";
import Sidebar from "@/components/sidebar";
import YourCasesPage from "@/components/yourcases";
import AuthGuard from "@/components/authguard";

export default function AllCasesPage() {

  return (
    <AuthGuard>
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1">
        <Sidebar/>
        <div className=" w-full px-16 bg-[#F9FAFB]">
         <YourCasesPage/>
        </div>
      </main>
    
    </div>
    </AuthGuard>
  );
}
