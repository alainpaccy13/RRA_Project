package org.RRA.tax_appeal_system.Controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.requests.VoteRequest;
import org.RRA.tax_appeal_system.DTOS.responses.AppealDTO;
import org.RRA.tax_appeal_system.Models.Appeals;
import org.RRA.tax_appeal_system.Models.CommitteeVote;
import org.RRA.tax_appeal_system.Repositories.AppealsRepo;
import org.RRA.tax_appeal_system.Services.VotingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/appeals")  // ← CORRECT BASE PATH
public class VotingController {

    private final VotingService votingService;
    private final AppealsRepo appealsRepo;

    // 1. Submit vote
    @PostMapping("/{appealId}/vote")
    public ResponseEntity<Map<String, Object>> submitVote(
            @PathVariable UUID appealId,
            @Valid @RequestBody VoteRequest voteRequest,
            Principal principal) {

        try {
            String memberEmail = principal.getName();
            CommitteeVote vote = votingService.submitVote(appealId, voteRequest, memberEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Vote submitted successfully");
            response.put("vote", Map.of(
                    "id", vote.getId(),
                    "committeeMemberName", vote.getCommitteeMemberName(),
                    "committeeDecision", vote.getCommitteeDecision(),
                    "votedAt", vote.getVotedAt()
            ));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 2. Check if user voted all appeals
    @PostMapping("/are-all-appeals-voted")
    @Transactional(readOnly = true)
    public ResponseEntity<?> hasUserVotedAllTheAppeals(
            Principal principal,
            @RequestBody List<UUID> appealIds) {

        if (appealIds == null || appealIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "List cannot be empty"));
        }

        Map<UUID, Boolean> result = votingService.hasUserVotedAllTheAppeals(principal.getName(), appealIds);
        return ResponseEntity.ok(result);
    }


    // 4. GET ALL VOTES (Leader only — service enforces it)
// Add this method to your existing VotingController.java
    @GetMapping("/{appealId}/all-votes")
    @Transactional(readOnly = true)
    public ResponseEntity<List<VotingService.SimpleVoteDTO>> getAllVotesForAppeal(
            @PathVariable UUID appealId,
            Principal principal) {

        List<VotingService.SimpleVoteDTO> votes = votingService.getAllVotesForAppeal(appealId, principal.getName());
        return ResponseEntity.ok(votes);
    }

}