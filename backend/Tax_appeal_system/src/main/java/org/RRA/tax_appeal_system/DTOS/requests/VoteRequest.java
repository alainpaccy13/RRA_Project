package org.RRA.tax_appeal_system.DTOS.requests;

import lombok.Data;
import org.RRA.tax_appeal_system.Enums.VoteDecision;

import java.util.UUID;

@Data
public class VoteRequest {
    private UUID committeeMemberId;
    private String committeeMemberName;
    private VoteDecision committeeDecision;
    private String voteComment;
}
