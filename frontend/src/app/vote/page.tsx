"use client";

import Sidebar from "@/components/sidebar";
import VotePage from "@/components/vote";
import AuthGuard from "@/components/authguard";

export default function MeetingsPage() {

  return (
    <AuthGuard>
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1">
        <Sidebar/>
        <div className=" w-full px-16">
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Vote
            </h1>
        <p className="text-lg text-gray-500 mb-12">
            Vote
        </p>
         <VotePage/>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
