package org.RRA.tax_appeal_system.Repositories;

import org.RRA.tax_appeal_system.Enums.CaseStatus;
import org.RRA.tax_appeal_system.Models.MyCases;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MyCasesRepo extends JpaRepository<MyCases, UUID> {

    List<MyCases> findByNotePreparator(String notePreparator);

    @Query("SELECT mc FROM my_cases mc WHERE mc.caseId.caseId = :caseId")
    Optional<MyCases> findByCaseId(@Param("caseId") String caseId);

    int countByStatus(CaseStatus status);

    @Query("SELECT COUNT(mc) FROM my_cases mc WHERE mc.status IN (org.RRA.tax_appeal_system.Enums.CaseStatus.RESOLVED)")
    int countReviewedCases();

    @Query("SELECT m.month, SUM(m.justified) as justified, SUM(m.unjustified) as unjustified " +
            "FROM (" +
            "   SELECT MONTH(ci.appealDate) as month, a.appealId as appealId, " +
            "   CASE WHEN MAX(CASE WHEN cv.committeeDecision = org.RRA.tax_appeal_system.Enums.VoteDecision.WITHBASIS THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END as justified, " +
            "   CASE WHEN MAX(CASE WHEN cv.committeeDecision = org.RRA.tax_appeal_system.Enums.VoteDecision.NOBASIS THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END as unjustified " +
            "   FROM my_cases mc " +
            "   JOIN mc.caseId ci " +
            "   JOIN ci.taxAudited ta " +
            "   JOIN ta.appeals a " +
            "   LEFT JOIN CommitteeVote cv ON cv.appeal = a " +
            "   WHERE YEAR(ci.appealDate) = YEAR(CURRENT_DATE) " +
            "   GROUP BY MONTH(ci.appealDate), a.appealId" +
            ") m " +
            "GROUP BY m.month " +
            "ORDER BY m.month")
    List<Object[]> getCaseAnalyticsByMonth();

    @Query("SELECT mc FROM my_cases mc WHERE mc.caseId.appealDate >= :startOfWeek")
    List<MyCases> findCasesThisWeek(@Param("startOfWeek") LocalDate startOfWeek);

}
