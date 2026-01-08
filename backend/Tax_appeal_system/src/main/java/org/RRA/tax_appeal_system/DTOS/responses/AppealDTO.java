package org.RRA.tax_appeal_system.DTOS.responses;

import java.util.UUID;

public record AppealDTO(
        UUID AppealId,
        String appealPoint,
        String summarisedProblem,
        String auditorsOpinion,
        String proposedSolution
) { }
