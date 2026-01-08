"use client";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, FolderKanban } from "lucide-react";
import MeetingMinutesPage from "@/components/meetingminutes";
import AuthGuard from "@/components/authguard";

export default function CasesPage() {

  return (
    <AuthGuard>
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1">
        <Sidebar/>
        <div className="w-full bg-[#F9FAFB]">
          <MeetingMinutesPage/>
        </div>
      </main>
    
    </div>
    </AuthGuard>
  );
}
