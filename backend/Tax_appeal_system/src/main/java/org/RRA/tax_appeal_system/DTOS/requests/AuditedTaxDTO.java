package org.RRA.tax_appeal_system.DTOS.requests;

import java.util.List;

public record AuditedTaxDTO(
        String taxTypeAudited,
        double principalAmountToBePaid,
        double understatementFines,
        double fixedAdministrativeFines,
        double dischargedAmount,
        double otherFines,
        double totalTaxAndFinesToBePaid,
        List<AppealDetailsDTO> appeals
) {
}
