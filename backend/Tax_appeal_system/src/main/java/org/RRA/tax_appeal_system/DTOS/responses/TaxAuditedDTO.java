package org.RRA.tax_appeal_system.DTOS.responses;

import org.RRA.tax_appeal_system.DTOS.requests.AppealDetailsDTO;

import java.util.List;
import java.util.UUID;

public record TaxAuditedDTO (
        UUID taxAuditedId,
        String taxTypeAudited,
        double principalAmountToBePaid,
        double understatementFines,
        double fixedAdministrativeFines,
        double dischargedAmount,
        double otherFines,
        double totalTaxAndFinesToBePaid,
        List<AppealDTO> appeals
){
}
