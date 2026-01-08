package org.RRA.tax_appeal_system.DTOS.responses;

import org.RRA.tax_appeal_system.DTOS.requests.AuditedTaxDTO;
import org.RRA.tax_appeal_system.Enums.CaseStatus;

import java.time.LocalDate;
import java.util.List;

public record ExplanatoryNoteResponseDTO(
        String caseId,
        String auditorsName,
        LocalDate taxAssessmentAcknowledgementDateByTaxpayer,
        String taxAssessmentTime,
        LocalDate appealDate,
        LocalDate appealExpireDate,
        String casePresenter,
        String tin,
        String attachmentLink,
        CaseStatus status,
        LocalDate preparatorSubmissionDate,
        List<TaxAuditedDTO> taxAudited
) {
}
