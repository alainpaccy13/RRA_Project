"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from "@/components/sidebar";
import { TaxForm } from "@/components/taxForm";
import AuthGuard from "@/components/authguard";

// A wrapper component is the standard Next.js pattern for using search params.
// It ensures that only this part of the page is client-rendered and waits for the URL data.
function NewCaseForm() {
  const searchParams = useSearchParams();
  const caseIdToEdit = searchParams.get('editCaseId');

  // Determine if we are in "edit" mode
  const isEditMode = !!caseIdToEdit;

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mt-2">
        {/* Change the title based on the mode */}
        {isEditMode ? `Edit Case: ${caseIdToEdit}` : "Submit a New Case"}
      </h1>
      <p className="text-lg text-gray-500 mb-12">
        {isEditMode ? "Update the details below." : "Fill out the form below to generate an explanatory note."}
      </p>
      
      {/* Pass the caseIdToEdit prop to your TaxForm component */}
      <TaxForm caseIdToEdit={caseIdToEdit} />
    </>
  );
}

export default function NewCasePage() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <main className="flex flex-1">
          <Sidebar/>
          <div className="w-full px-16 pt-6 bg-[#F9FAFB]">
            {/* Wrap the component in Suspense as required by Next.js for useSearchParams */}
            <Suspense fallback={<div>Loading form...</div>}>
              <NewCaseForm />
            </Suspense>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}