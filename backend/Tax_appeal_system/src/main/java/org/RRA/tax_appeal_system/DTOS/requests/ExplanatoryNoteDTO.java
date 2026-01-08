package org.RRA.tax_appeal_system.DTOS.requests;

import java.util.Date;
import java.util.List;
import java.util.UUID;

public record ExplanatoryNoteDTO(
        String caseId,
        String auditorsName,
        Date taxAssessmentAcknowledgementDateByTaxpayer,
        String taxAssessmentTime,
        Date appealDate,
        Date appealExpireDate,
        String casePresenter,
        String tin,
        String attachmentLink,
        List<AuditedTaxDTO> taxAudited
) {
}

;
