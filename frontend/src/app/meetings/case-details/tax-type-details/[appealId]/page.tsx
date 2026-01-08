"use client";

import Sidebar from "@/components/sidebar";
import AuthGuard from "@/components/authguard";
import { AppealPointDetails } from "@/components/AppealPointDetails";
import { useSearchParams } from "next/navigation";
import { Suspense, use } from "react"; // Added 'use' import

function AppealPointPageContent({ appealId }: { appealId: string }) {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');

  if (!caseId) {
    return <div className="text-red-500 font-bold p-8">Error: Case ID is missing from the URL.</div>;
  }
  
  return <AppealPointDetails caseId={caseId} appealId={appealId} />;
}

// Define params as a Promise
export default function DynamicAppealDetailsPage({ params }: { params: Promise<{ appealId: string }> }) {
  // Unwrap the params using 'use'
  const resolvedParams = use(params);

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <main className="flex flex-1">
          <Sidebar />
          <div className="w-full px-16 py-6 bg-gray-50">
             <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
                <AppealPointPageContent appealId={resolvedParams.appealId} />
             </Suspense>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}