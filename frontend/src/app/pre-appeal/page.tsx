"use client";

import { Suspense } from 'react';
import Sidebar from "@/components/sidebar";
import AuthGuard from "@/components/authguard";
import PreAppealCases from "@/components/preappealcases";

export default function PreAppealPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <main className="flex flex-1">
          <Sidebar/>
          <div className="w-full px-16 pt-6 bg-[#F9FAFB]">
            <Suspense fallback={<div>Loading pre-appeal cases...</div>}>
              <PreAppealCases />
            </Suspense>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}