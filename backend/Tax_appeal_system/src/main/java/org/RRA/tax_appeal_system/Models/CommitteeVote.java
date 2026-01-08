package org.RRA.tax_appeal_system.Models;

import jakarta.persistence.*;
import lombok.Data;
import org.RRA.tax_appeal_system.Enums.VoteDecision;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name ="committee_votes",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"appeal_id", "committee_member_id"})
        }
)
@Data
public class CommitteeVote {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "appeal_id", nullable = false)
    private Appeals appeal;

    @Column(name = "committee_member_id", nullable = false)
    private UUID committeeMemberId;

    @Column(name = "committee_member_name", nullable = false)
    private String committeeMemberName;

    @Enumerated(EnumType.STRING)
    @Column(name = "committee_decision", nullable = false)
    private VoteDecision committeeDecision;

    @Column(name = "vote_comment")
    private String voteComment;

    @Column(name = "voted_at", nullable = false)
    private LocalDateTime votedAt = LocalDateTime.now();
}