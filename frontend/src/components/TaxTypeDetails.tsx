"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, HandCoins, Banknote, Coins, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface AppealDTO {
  AppealId: string;
  appealPoint: string;
  summarisedProblem: string;
  auditorsOpinion: string;
  proposedSolution: string;
}

interface TaxAuditedDTO {
  taxAuditedId: string;
  taxTypeAudited: string;
  principalAmountToBePaid: number;
  understatementFines: number;
  otherFines: number;
  fixedAdministrativeFines: number;
  appeals: AppealDTO[];
}

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  amount?: number;
  color: string;
}

const InfoCard = ({ icon: Icon, title, amount = 0, color }: InfoCardProps) => (
  <div className="flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-bold">{amount.toLocaleString()} frw</p>
    </div>
  </div>
);

export function TaxTypeDetails({ caseId, taxAuditedId }: { caseId: string, taxAuditedId: string }) {
  const [taxItem, setTaxItem] = useState<TaxAuditedDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votedAppeals, setVotedAppeals] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Case Details
        const response = await api.get(`/api/v1/auth/explanatory_note/${caseId}`);
        const caseData = response.data.data;
        
        const specificTaxItem = caseData.taxAudited.find(
          (item: TaxAuditedDTO) => item.taxAuditedId === taxAuditedId
        );

        if (!specificTaxItem) {
          throw new Error("Audited tax item not found for the given ID.");
        }

        setTaxItem(specificTaxItem);

        // 2. Check Vote Status for these appeals
        // Extract all appeal IDs from the found tax item
        const appealIds = specificTaxItem.appeals.map((a: AppealDTO) => a.AppealId);

        if (appealIds.length > 0) {
          try {
            const voteStatusUrl = `/api/appeals/are-all-appeals-voted`;
            
            // Send the array of IDs to the backend
            const voteResponse = await api.post(voteStatusUrl, appealIds);
            const voteMap = voteResponse.data; // Expected format: { "uuid1": true, "uuid2": false }

            if (voteMap) {
              // Filter keys (IDs) where the value is true
              const votedIds = Object.keys(voteMap).filter(id => voteMap[id] === true);
              setVotedAppeals(votedIds);
            }
          } catch (voteErr) {
            console.error("Failed to fetch vote statuses:", voteErr);
            // We don't block the UI if vote check fails, we just don't show checkmarks
          }
        }

      } catch (err) {
        console.error("Failed to fetch tax type details:", err);
        setError("Could not load the details for this tax type.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caseId, taxAuditedId]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error || !taxItem) return <div className="text-center text-red-500 p-8">{error || "Data not found"}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <p className="text-sm text-gray-500">
        meeting &gt; {caseId} &gt; {taxItem.taxTypeAudited}
      </p>

      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">{taxItem.taxTypeAudited}</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-green-50 rounded-lg">
            <InfoCard icon={HandCoins} title="Principal amount to be paid" amount={taxItem.principalAmountToBePaid} color="bg-green-400" />
            <InfoCard icon={Banknote} title="Understatement fines" amount={taxItem.understatementFines} color="bg-purple-400" />
            <InfoCard icon={Coins} title="Fixed administrative fines" amount={taxItem.fixedAdministrativeFines} color="bg-orange-400" />
            <InfoCard icon={HandCoins} title="Other fines" amount={taxItem.otherFines} color="bg-orange-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
               <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold">Appeal points</h2>
          </div>
          <div className="space-y-3">
            {taxItem.appeals.map((appeal, index) => (
              <Link
                key={appeal.AppealId}
                href={`/meetings/case-details/tax-type-details/${appeal.AppealId}?caseId=${caseId}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{appeal.appealPoint}</span>
                  </div>
                  {votedAppeals.includes(appeal.AppealId) && (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => router.back()} className="bg-[#18668D] hover:bg-[#134d66]">
        Back
      </Button>
    </div>
  );
}