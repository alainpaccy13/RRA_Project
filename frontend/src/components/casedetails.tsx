"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExplanatoryNote } from "./explanatorynote";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { File as FileIcon } from "lucide-react";


interface TaxAuditedDTO {
  taxAuditedId: string;
  taxTypeAudited: string;
  principalAmountToBePaid: number;
  understatementFines: number;
  fixedAdministrativeFines: number;
  dischargedAmount: number;
  totalTaxAndFinesToBePaid: number;
  appeals: any[];
}

interface CaseDetailsData {
  caseId: string;
  auditorsName: string;
  appealDate: string;
  tin: string;
  taxAudited: TaxAuditedDTO[];
  attachmentLink: string;
}

export function CaseDetailsPage({ caseId }: { caseId: string }) {
  const [caseDetails, setCaseDetails] = useState<CaseDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (caseId) {
      const fetchCaseDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.get(`/api/v1/auth/explanatory_note/${caseId}`);
          if (response.data && response.data.data) {
            setCaseDetails(response.data.data);
          } else {
            throw new Error("Case data not found in API response.");
          }
        } catch (err) {
          console.error("Failed to fetch case details:", err);
          setError("Failed to load case details. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchCaseDetails();
    }
  }, [caseId]);

  if (loading) {
    return <div className="text-center p-8">Loading case details...</div>;
  }

  if (error || !caseDetails) {
    return <div className="text-center text-red-500 p-8">{error || "Case not found."}</div>;
  }
  
  const totalTaxToBePaid = caseDetails.taxAudited.reduce(
    (sum, item) => sum + item.totalTaxAndFinesToBePaid, 0
  );

  return (
    <>
      {/* --- 2. RESTORE THE FULL UI FOR THE CASE DETAILS PAGE --- */}
      <Card className="w-full max-w-4xl mx-auto my-8 p-6 shadow-lg">
        <CardContent className="p-0">
          {/* Case Information Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Case Information</h2>
              <hr className="border-1" />
              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <p className="text-gray-600">Case ID</p>
                <p className="font-medium">{caseDetails.caseId}</p>

                <p className="text-gray-600">Appeal Date</p>
                <p className="font-medium">{new Date(caseDetails.appealDate).toLocaleDateString()}</p>

                <p className="text-gray-600">Tax to be paid</p>
                <p className="font-bold text-red-500">{totalTaxToBePaid.toLocaleString()} RWF</p>
              </div>
            </div>

            {/* Taxpayer Details Section */}
            <div>
              <h2 className="text-xl font-bold mb-4">Taxpayer Details</h2>
              <hr className="border-1" />
              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <p className="text-gray-600">Taxpayer TIN</p>
                <p className="font-medium">{caseDetails.tin}</p>
                
                <p className="text-gray-600">Auditor</p>
                <p className="font-medium">{caseDetails.auditorsName}</p>
              </div>
            </div>
          </div>

          {/* Audited Tax Types Section (with corrected links) */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Audited Tax Types</h2>
            <hr className="border-1" />
            <div className="grid md:grid-cols-4 gap-4 p-2 mt-3">
              {caseDetails.taxAudited.map((taxItem) => (
                <Link
                  key={taxItem.taxAuditedId}
                  href={`/meetings/case-details/tax-type-details?caseId=${caseDetails.caseId}&taxAuditedId=${taxItem.taxAuditedId}`}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-150 ease-in-out cursor-pointer flex justify-center items-center py-4 text-center"
                >
                  <span className="text-lg font-semibold text-[#18668D] underline">
                    {taxItem.taxTypeAudited}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Attachment Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Attachments</h2>
            <hr className="border-gray-200" />
            <div className="mt-4">
              {caseDetails.attachmentLink ? (
                <a
                  href={caseDetails.attachmentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-colors"
                >
                  <FileIcon className="h-4 w-4 text-gray-600" />
                  <span>Attachment Preview</span>
                </a>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No attachment was provided for this case.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Back Button */}
      <Button 
        onClick={() => router.back()}
        className="bg-[#18668D] hover:bg-[#134d66]"
      >
        Back
      </Button>
    </>
  );
}