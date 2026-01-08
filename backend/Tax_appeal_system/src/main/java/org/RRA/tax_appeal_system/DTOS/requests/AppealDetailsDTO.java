package org.RRA.tax_appeal_system.DTOS.requests;

public  record AppealDetailsDTO(
        String appealPoint,
        String summarisedProblem,
        String auditorsOpinion,
        String proposedSolution
){ }
