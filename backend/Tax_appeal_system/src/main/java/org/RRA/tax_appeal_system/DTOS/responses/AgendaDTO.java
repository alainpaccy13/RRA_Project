package org.RRA.tax_appeal_system.DTOS.responses;

import org.RRA.tax_appeal_system.Enums.CaseStatus;

import java.time.LocalDate;
import java.util.UUID;

public record AgendaDTO(
        String caseId,
        String taxpayerName,
        String casePresenter,
        String tin,
        CaseStatus caseStatus,
        long daysLeft,
        LocalDate appealDate,
        double amountDischarged,
        double taxToBePaid,
        String auditor

) {

}
