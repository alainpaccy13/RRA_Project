"use client";
import Sidebar from "@/components/sidebar";
import { ExplanatoryNoteGenerator } from "@/components/ExplanatoryNoteGenerator"; 
import AuthGuard from "@/components/authguard";

export default function ExplanatoryNotePage() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <main className="flex flex-1">
          <Sidebar />
          <div className="w-full px-16 bg-[#F9FAFB] py-8">
            <ExplanatoryNoteGenerator />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}