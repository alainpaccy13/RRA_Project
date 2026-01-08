package org.RRA.tax_appeal_system.Services;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.requests.VoteRequest;
import org.RRA.tax_appeal_system.DTOS.responses.AppealDTO;
import org.RRA.tax_appeal_system.DTOS.responses.ExplanatoryNoteDTO;
import org.RRA.tax_appeal_system.DTOS.responses.ExplanatoryNoteResponseDTO;
import org.RRA.tax_appeal_system.DTOS.responses.TaxAuditedDTO;
import org.RRA.tax_appeal_system.Enums.CaseStatus;
import org.RRA.tax_appeal_system.Enums.CommitteeGroup;
import org.RRA.tax_appeal_system.Enums.Privilege;
import org.RRA.tax_appeal_system.Enums.VoteDecision;
import org.RRA.tax_appeal_system.Exceptions.CaseNotFoundException;
import org.RRA.tax_appeal_system.Models.*;
import org.RRA.tax_appeal_system.Repositories.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VotingService {
    private final AppealsRepo appealsRepo;
    private final CommitteeVoteRepository voteRepository;
    private final UserInfoRepo userInfoRepo;
    private final CommitteeVoteRepository committeeVoteRepo;
    private final CaseInfoRepo caseInfoRepo;


    public List<Appeals> getAllAppeals() {
        return appealsRepo.findAll();
    }

    public Appeals getAppealById(UUID appealId) {
        return appealsRepo.findByAppealId(appealId).orElseThrow(() -> new RuntimeException("Appeal not found" + appealId));
    }


    public Map<UUID, Boolean> hasUserVotedAllTheAppeals(String committeeEmail, List<UUID> appealsList) {
        Optional<UserInfo> optUser = userInfoRepo.findByEmail(committeeEmail);
        if (optUser.isEmpty()) {
            throw new UsernameNotFoundException("User not found " + committeeEmail);
        }
        UserInfo user = optUser.get();
        UUID memberId = user.getId();
        Map<UUID, Boolean> result = new HashMap<>();
        for (UUID appeal : appealsList) {
            Appeals appealObj = getAppealById(appeal);
            Optional<CommitteeVote> vote = committeeVoteRepo.findByAppealIdAndCommitteeMemberId(appeal, memberId);
            result.put(appeal, vote.isPresent());
        }
        return result;
    }

    @Transactional
    public CommitteeVote submitVote(UUID appealId, VoteRequest voteRequest,String memberEmail) {
        Appeals appeal = getAppealById(appealId);
        System.out.println("DEBUG: The class of committeeMemberId is: " + voteRequest.getCommitteeMemberId().getClass().getName());

        voteRepository.findByAppealIdAndCommitteeMemberId(appealId, voteRequest.getCommitteeMemberId()).ifPresent(vote -> {
            throw new RuntimeException("Committee member has already voted on this appeal");});

        CommitteeVote vote = new CommitteeVote();
        vote.setAppeal(appeal);
        vote.setCommitteeMemberId(voteRequest.getCommitteeMemberId());
        vote.setCommitteeMemberName(voteRequest.getCommitteeMemberName());
        vote.setCommitteeDecision(voteRequest.getCommitteeDecision());
        vote.setVoteComment(voteRequest.getVoteComment());
        CommitteeVote voteResults =voteRepository.saveAndFlush(vote);

        // check and update the Case status if resolved
        //but first let us get the Committee group correspondance for the committee we have
        UserInfo user = userInfoRepo.findByEmail(memberEmail).orElseThrow(() -> new RuntimeException("User not found" + memberEmail));
        CommitteeGroup membershipGroup = user.getCommitteeGroup();

        CaseInfo caseInfo = appeal.getTaxAuditedId().getCaseId();  // Traverse relationships
        if (isCaseResolved(caseInfo,membershipGroup)) {
            caseInfo.setStatus(CaseStatus.RESOLVED);
            caseInfoRepo.save(caseInfo);
        }


        return voteResults;
    }

    private int getPresentMembersForMeeting(CommitteeGroup membership){
        return userInfoRepo.countByCommitteeGroupAndAvailabilityStatus(membership,true);
    }

    private boolean isAppealFullyVoted(Appeals appeal,CommitteeGroup membershipGroup) {
        int requiredVotes = getPresentMembersForMeeting(membershipGroup);  // Logic to fetch quorum, e.g., 5 members
        long voteCount = committeeVoteRepo.countByAppeal(appeal);
        return voteCount >= requiredVotes;
    }

    // Checking that all appeals have been voted
    private boolean isCaseResolved(CaseInfo caseInfo,CommitteeGroup membershipGroup) {
        return caseInfo.getTaxAudited().stream()
                .allMatch(taxAudited -> taxAudited.getAppeals().stream()
                        .allMatch(appeal -> isAppealFullyVoted(appeal, membershipGroup)));
    }

    // In VotingService.java
    public List<SimpleVoteDTO> getAllVotesForAppeal(UUID appealId, String requesterEmail) {
        UserInfo requester = userInfoRepo.findByEmail(requesterEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (requester.getCommitteeRole() != Privilege.COMMITTEE_LEADER) {
            throw new AccessDeniedException("Only COMMITTEE_LEADER can view all votes");
        }

        Appeals appeal = appealsRepo.findByAppealId(appealId)
                .orElseThrow(() -> new RuntimeException("Appeal not found"));

        List<CommitteeVote> votes = committeeVoteRepo.findByAppeal(appeal);

        return votes.stream()
                .map(vote -> new SimpleVoteDTO(
                        vote.getCommitteeMemberName(),
                        vote.getCommitteeDecision()
                ))
                .sorted((a, b) -> a.committeeMemberName().compareToIgnoreCase(b.committeeMemberName()))
                .toList();
    }

    public record SimpleVoteDTO(
            String committeeMemberName,
            VoteDecision committeeDecision  // WITHBASIS or NOBASIS
    ) {}


}