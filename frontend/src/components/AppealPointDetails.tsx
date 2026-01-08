"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppealVote } from './AppealVote';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Types
interface AppealDTO {
  AppealId: string;
  appealPoint: string;
  summarisedProblem: string;
  auditorsOpinion: string;
  proposedSolution: string;
}

interface SimpleVote {
  committeeMemberName: string;
  committeeDecision: "WITHBASIS" | "NOBASIS";
}

type Tab = 'appeal' | 'opinion' | 'solution' | 'comments' | 'votes';

export function AppealPointDetails({ caseId, appealId }: { caseId: string; appealId: string }) {
  const [appeal, setAppeal] = useState<AppealDTO | null>(null);
  const [taxTypeName, setTaxTypeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('appeal');
  const [hasVoted, setHasVoted] = useState(false);
  const [comment, setComment] = useState<string>('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [caseStatus, setCaseStatus] = useState<string>(''); 

  // Leader-only
  const [isLeader, setIsLeader] = useState(false);
  const [allVotes, setAllVotes] = useState<SimpleVote[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  const router = useRouter();

  // Check if user is COMMITTEE_LEADER
  useEffect(() => {
    const role = localStorage.getItem("staff_role");
    setIsLeader(role === "COMMITTEE_LEADER");
  }, []);

  // Check if current user has voted
  const checkVoteStatus = async () => {
    try {
      const response = await api.post(`/api/appeals/are-all-appeals-voted`, [appealId]);
      const data = response.data;
      setHasVoted(data[appealId] === true);
    } catch (err) {
      console.error("Error checking vote status:", err);
    }
  };

  // Fetch decision comment
  const fetchComment = async () => {
    setLoadingComment(true);
    try {
      const response = await api.post(`/api/v1/auth/explanatory_note/appeal/comment/${appealId}`);
      setComment(response.data?.comment || '');
    } catch (err) {
      console.error("Failed to fetch comment:", err);
      setComment('');
    } finally {
      setLoadingComment(false);
    }
  };

  // Fetch all votes (only for leader)
  const fetchAllVotes = async () => {
    if (!isLeader) return;
    setLoadingVotes(true);
    try {
      const res = await api.get(`/api/appeals/${appealId}/all-votes`);
      setAllVotes(res.data);
    } catch (err) {
      console.error("Failed to load votes:", err);
    } finally {
      setLoadingVotes(false);
    }
  };

  useEffect(() => {
    checkVoteStatus();
    fetchComment();

    const fetchAppealDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/v1/auth/explanatory_note/${caseId}`);
        const caseData = response.data.data;

        setCaseStatus(caseData.status); 
        let foundAppeal: AppealDTO | undefined;
        let foundTaxType = '';

        for (const taxItem of caseData.taxAudited) {
          foundAppeal = taxItem.appeals.find((a: any) => a.AppealId === appealId);
          if (foundAppeal) {
            foundTaxType = taxItem.taxTypeAudited || taxItem.auditedTaxType || 'Unknown Tax Type';
            break;
          }
        }

        if (foundAppeal) {
          setAppeal(foundAppeal);
          setTaxTypeName(foundTaxType);
        } else {
          throw new Error("Appeal point not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load appeal details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppealDetails();
  }, [caseId, appealId]);

  // Fetch votes when "votes" tab is opened
  useEffect(() => {
    if (activeTab === 'votes' && isLeader) {
      fetchAllVotes();
    }
  }, [activeTab, isLeader, appealId]);

  const handleVoteSuccess = () => {
    setHasVoted(true);
    fetchComment();
  };

  if (loading) return <div className="text-center p-12 text-gray-600">Loading appeal details...</div>;
  if (error || !appeal) return <div className="text-center p-12 text-red-500">{error || "Appeal not found"}</div>;

  const withBasisCount = allVotes.filter(v => v.committeeDecision === "WITHBASIS").length;
  const noBasisCount = allVotes.filter(v => v.committeeDecision === "NOBASIS").length;

  const TabButton = ({ tab, label }: { tab: Tab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`pb-3 px-6 text-sm font-medium transition-all border-b-2 ${
        activeTab === tab
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
      {tab === 'votes' && isLeader && ` (${allVotes.length})`}
    </button>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{taxTypeName}</h1>
        <p className="text-lg text-gray-500 mt-1">Appeal Point Details</p>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8 overflow-x-auto">
              <TabButton tab="appeal" label="Appeal Point" />
              <TabButton tab="opinion" label="Auditor's Opinion" />
              <TabButton tab="solution" label="Proposed Solution" />
              <TabButton tab="comments" label="Decision Comment" />
              {isLeader && <TabButton tab="votes" label="Committee Votes" />}
            </nav>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {activeTab === 'appeal' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Appeal Point</h3>
                  <p className="text-gray-700 leading-relaxed">{appeal.appealPoint}</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{appeal.summarisedProblem}</p>
                </div>
              </div>
            )}

            {activeTab === 'opinion' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Auditor's Opinion</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{appeal.auditorsOpinion}</p>
              </div>
            )}

            {activeTab === 'solution' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Proposed Solution</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{appeal.proposedSolution}</p>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Decision Comment</h3>
                {loadingComment ? (
                  <p className="text-gray-500 italic">Loading comment...</p>
                ) : !comment ? (
                  <p className="text-gray-500 italic">No decision comment available.</p>
                ) : (
                  <div className="p-6 bg-gray-50 border rounded-lg">
                    <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{comment}</p>
                  </div>
                )}
              </div>
            )}

            {/* LEADER ONLY: All Votes Tab */}
            {activeTab === 'votes' && isLeader && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Committee Decisions</h3>

                {/* Summary */}
                <div className="flex items-center gap-8 text-lg font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-green-600 rounded"></span>
                    <span>With Basis:</span>
                    <span className="text-green-700">{withBasisCount}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-red-600 rounded"></span>
                    <span>No Basis:</span>
                    <span className="text-red-700">{noBasisCount}</span>
                  </div>
                  <div className="ml-auto text-gray-600">
                    Total: <span className="font-bold">{allVotes.length}</span>
                  </div>
                </div>

                {/* Table */}
                {loadingVotes ? (
                  <p className="text-gray-500 italic">Loading votes...</p>
                ) : allVotes.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500 text-lg">No votes recorded yet</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Committee Member</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Decision</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {allVotes.map((vote, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {vote.committeeMemberName}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-4 py-2 rounded-full text-xs font-bold text-white ${
                                vote.committeeDecision === "WITHBASIS" ? "bg-green-600" : "bg-red-600"
                              }`}>
                                {vote.committeeDecision === "WITHBASIS" ? "WITH BASIS" : "NO BASIS"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button onClick={() => router.back()} variant="outline" size="lg">
          Back
        </Button>

        {!hasVoted && caseStatus !== 'RESOLVED' ?(
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-[#18668D] hover:bg-[#134d66] font-bold">
                Vote
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">Vote on Appeal Point</DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <p className="font-medium text-sm bg-gray-100 p-4 rounded mb-6">
                  {appeal.appealPoint}
                </p>
                <AppealVote appealId={appeal.AppealId} onVoteSuccess={handleVoteSuccess} />
              </div>
            </DialogContent>
          </Dialog>
        ): (
           /* Optional: Show a message if resolved */
           caseStatus === 'RESOLVED' && !hasVoted && (
             <span className="text-red-500 font-bold border px-4 py-2 rounded-md bg-red-50">
               Case Closed (Resolved)
             </span>
           )
        )}
      </div>
    </div>
  );
}