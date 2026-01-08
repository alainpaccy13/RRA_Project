"use client";

import { Suspense } from 'react';
import Sidebar from "@/components/sidebar";
import AuthGuard from "@/components/authguard";
import { TaxTypeDetails } from '@/components/TaxTypeDetails'; 
import { useSearchParams } from 'next/navigation';


function TaxTypeDetailsContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const taxAuditedId = searchParams.get('taxAuditedId');

  if (!caseId || !taxAuditedId) {
    return (
      <div className="text-center text-red-500 font-semibold p-8">
        Error: Missing required case information in the URL.
      </div>
    );
  }

  return <TaxTypeDetails caseId={caseId} taxAuditedId={taxAuditedId} />;
}

export default function NestedTaxTypeDetailsPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <main className="flex flex-1">
          <Sidebar />
          <div className="w-full px-16 py-6 bg-[#F9FAFB]">
            <Suspense fallback={<div className="text-center">Loading Details...</div>}>
              <TaxTypeDetailsContent />
            </Suspense>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}