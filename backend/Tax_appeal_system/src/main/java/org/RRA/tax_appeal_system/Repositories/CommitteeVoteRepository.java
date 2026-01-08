package org.RRA.tax_appeal_system.Repositories;

import org.RRA.tax_appeal_system.Models.Appeals;
import org.RRA.tax_appeal_system.Models.CommitteeVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommitteeVoteRepository extends JpaRepository<CommitteeVote, UUID> {
    @Query("SELECT cv FROM CommitteeVote cv WHERE cv.appeal.appealId = :appealId")
    List<CommitteeVote> findByAppealId(@Param("appealId") UUID appealId);



    @Query("SELECT cv FROM CommitteeVote cv WHERE cv.appeal.appealId = :appealId " +
            "AND cv.committeeMemberId = :committeeMemberId")
    Optional<CommitteeVote> findByAppealIdAndCommitteeMemberId(
            @Param("appealId") UUID appealId,
            @Param("committeeMemberId") UUID committeeMemberId
    );

    int countByAppeal(Appeals appeal);

    List<CommitteeVote> findByAppeal_AppealId(UUID appealId);

    List<CommitteeVote> findByAppeal(Appeals appeal);
}