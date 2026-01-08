"use client";

import { Suspense } from 'react';
import Sidebar from "@/components/sidebar";
import { CaseDetailsPage } from "@/components/casedetails";
import { useSearchParams } from 'next/navigation';
import AuthGuard from "@/components/authguard";

// A wrapper component to access search params
function CaseDetailsContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');

  if (!caseId) {
    return (
      <div className="text-center text-red-500">
        Error: Case ID is missing from the URL.
      </div>
    );
  }

  return <CaseDetailsPage caseId={caseId} />;
}

export default function MeetingsPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <main className="flex flex-1">
          <Sidebar />
          <div className="w-full px-16 bg-[#F9FAFB]">
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Case Details
            </h1>
            <p className="text-lg text-gray-500 mb-12">
              Look the Claim in details
            </p>
            {/* Suspense is good practice for components that read search params */}
            <Suspense fallback={<div>Loading...</div>}>
              <CaseDetailsContent />
            </Suspense>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}