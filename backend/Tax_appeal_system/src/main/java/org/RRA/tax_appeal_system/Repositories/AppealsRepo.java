package org.RRA.tax_appeal_system.Repositories;

import org.RRA.tax_appeal_system.Models.Appeals;
import org.RRA.tax_appeal_system.Models.TaxAudited;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppealsRepo extends JpaRepository<Appeals, UUID> {
    Optional<Appeals> findByTaxAuditedId_Id(UUID taxAuditedId);

    List<Appeals> findByTaxAuditedId(TaxAudited taxAudited);

    Optional<Appeals> findByAppealId(UUID appealId);
}
