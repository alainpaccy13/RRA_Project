"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, ThumbsDown, BadgeCheck, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface AppealVoteProps {
  appealId: string;
  onVoteSuccess: () => void;
}

type VoteStatus = 'idle' | 'voting' | 'voted' | 'error';
type VoteDecision = 'WITHBASIS' | 'NOBASIS' | 'ABSTAIN';

const isUUID = (str: string | null | undefined): boolean => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export function AppealVote({ appealId }: AppealVoteProps) {
  const [status, setStatus] = useState<VoteStatus>('idle');
  const [feedback, setFeedback] = useState('');
  const [voteComment, setVoteComment] = useState(""); 
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  useEffect(() => {
    // Set user role
    const role = localStorage.getItem('staff_role');
    setUserRole(role);

    const checkVoteStatus = async () => {
      const checkVoteStatusUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/appeals/are-all-appeal-voted`;
      const token = localStorage.getItem("staff_token");
      
      let committeeMemberId = localStorage.getItem('staff_id');
      // Clean up ID if it was stored with quotes
      if (committeeMemberId) {
        committeeMemberId = committeeMemberId.replace(/['"]+/g, '');
      }

      if (!token || !committeeMemberId) return;

      // Payload for checking status - typically requires the appeal and the member
      const payload = {
        appealId: appealId,
        committeeMemberId: committeeMemberId
      };

      try {
        const response = await fetch(checkVoteStatusUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          // Assuming the API returns a boolean true/false or an object { voted: true }
          // Adjust 'data === true' based on your exact API response structure
          if (data === true || data.hasVoted === true) {
            setHasVoted(true);
            setFeedback('You have already cast your vote on this appeal point.');
          }
        }
      } catch (error) {
        console.error("Error checking vote status:", error);
      }
    };

    checkVoteStatus();
  }, [appealId]);
  

  const handleVote = async (decision: VoteDecision) => {
    setStatus('voting');
    setFeedback('');

    let committeeMemberId = localStorage.getItem('staff_id');
    // Clean up ID if it was stored with quotes
    if (committeeMemberId) {
      committeeMemberId = committeeMemberId.replace(/['"]+/g, '');
    }
    
    const committeeMemberName = localStorage.getItem('staff_name');

    if (!isUUID(committeeMemberId) || !committeeMemberName) {
      const errorMessage = `Authentication Error: Your user ID is invalid. Please log out and log back in.`;
      setFeedback(errorMessage);
      setStatus('error');
      return;
    }

    const payload = {
      committeeMemberId,
      committeeMemberName,
      committeeDecision: decision,
      voteComment: userRole === 'COMMITTEE_LEADER' ? voteComment : ''
    };

    try {
      const token = localStorage.getItem("staff_token");
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/appeals/${appealId}/vote`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      // Update state on success
      setHasVoted(true);
      setStatus('voted');
      
      let decisionText = '';
      if (decision === 'WITHBASIS') decisionText = 'with basis';
      else if (decision === 'NOBASIS') decisionText = 'not basis';
      else decisionText = 'abstained';
      
      setFeedback(`You have successfully voted that the appeal is ${decisionText}.`);

    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while submitting your vote.';
      setStatus('error');
      setFeedback(errorMessage);
      console.error('Vote submission error:', err);
    }
  };

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold">Vote Cast</h3>
        <p className="text-sm text-gray-600">{feedback}</p>
      </div>
    );
  }

  if (status === 'voted') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold">Vote Cast Successfully</h3>
        <p className="text-sm text-gray-600">{feedback}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">
      <h3 className="text-lg font-bold text-left">Cast Your Vote</h3>
      {userRole === 'COMMITTEE_LEADER' && (
        <div className="space-y-2">
          <label htmlFor="voteComment" className="text-sm font-medium">
            Comment
          </label>
          <Textarea
            id="voteComment"
            placeholder="Provide your insights on the appeal"
            value={voteComment}
            onChange={(e) => setVoteComment(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      )}
      <div className='flex justify-between items-center space-x-2'>
        <Button 
          variant='ghost'
          className='flex-1 justify-center bg-slate-100 text-slate-700 hover:bg-slate-200 ring-1 ring-inset ring-slate-300 space-x-2 rounded-lg'
          disabled={status === 'voting'}
          onClick={() => handleVote('ABSTAIN')}
        >
          <Clock className='h-4 w-4' />
          <span>Abstain</span>
        </Button>
        
        <Button 
          variant='ghost' 
          className='flex-1 justify-center bg-red-100 text-red-600 hover:bg-red-200 space-x-2 rounded-lg'
          disabled={status === 'voting'}
          onClick={() => handleVote('NOBASIS')}
        >
          <ThumbsDown className='h-4 w-4' />
          <span> No Basis</span>
        </Button>

        <Button 
          className='flex-1 justify-center bg-green-500 hover:bg-green-600 text-white space-x-2 rounded-lg'
          disabled={status === 'voting'}
          onClick={() => handleVote('WITHBASIS')}
        >
          <BadgeCheck className='h-4 w-4' />
          <span>With Basis</span>
        </Button>
      </div>
      {status === 'error' && <p className="mt-2 text-sm text-red-600">{feedback}</p>}
      {status === 'voting' && <p className="mt-2 text-sm text-gray-600 animate-pulse">Submitting vote...</p>}
    </div>
  );
}