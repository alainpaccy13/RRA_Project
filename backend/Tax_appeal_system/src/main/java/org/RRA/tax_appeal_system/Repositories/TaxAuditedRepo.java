package org.RRA.tax_appeal_system.Repositories;

import org.RRA.tax_appeal_system.Models.CaseInfo;
import org.RRA.tax_appeal_system.Models.TaxAudited;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaxAuditedRepo extends JpaRepository<TaxAudited, UUID> {

    List<TaxAudited> findByCaseId(CaseInfo caseInfo);
}
