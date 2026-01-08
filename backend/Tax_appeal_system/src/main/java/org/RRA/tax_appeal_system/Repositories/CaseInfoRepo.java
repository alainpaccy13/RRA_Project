package org.RRA.tax_appeal_system.Repositories;

import org.RRA.tax_appeal_system.Enums.CaseStatus;
import org.RRA.tax_appeal_system.Models.CaseInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CaseInfoRepo extends JpaRepository<CaseInfo, String> {
    boolean existsByCaseId(String caseId);
    Optional<CaseInfo> findByCaseId(String caseId);

    // Added for pre-appeal functionality
//    Page<CaseInfo> findByStatus(CaseStatus status, Pageable pageable);

    // Added for agenda functionality to fetch cases with multiple statuses
    Page<CaseInfo> findByStatusIn(List<CaseStatus> statuses, Pageable pageable);

    @Query("SELECT c FROM CaseInfo c JOIN c.myCases m WHERE c.status = :status AND m.notePreparator = :email")
    Page<CaseInfo> findByStatusAndPreparator(
            @Param("status") CaseStatus status,
            @Param("email") String email,
            Pageable pageable
    );
}
