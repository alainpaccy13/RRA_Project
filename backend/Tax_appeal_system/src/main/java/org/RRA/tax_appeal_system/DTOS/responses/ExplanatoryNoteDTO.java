package org.RRA.tax_appeal_system.DTOS.responses;

import org.RRA.tax_appeal_system.DTOS.requests.AuditedTaxDTO;

import java.time.LocalDate;
import java.util.List;

public record ExplanatoryNoteDTO(
        String caseId,
        String auditorsName,
        LocalDate taxAssessmentAcknowledgementDateByTaxpayer,
        String taxAssessmentTime,
        LocalDate appealDate,
        LocalDate appealExpireDate,
        String casePresenter,
        String tin,
        String attachmentLink,
        LocalDate preparatorSubmissionDate,
        List<AuditedTaxDTO> taxAudited
) {
}

;
