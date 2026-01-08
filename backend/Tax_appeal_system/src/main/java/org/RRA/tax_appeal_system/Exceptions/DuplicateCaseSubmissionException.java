package org.RRA.tax_appeal_system.Exceptions;

import java.util.UUID;

public class DuplicateCaseSubmissionException extends RuntimeException {
    public DuplicateCaseSubmissionException(String caseId) {
        super("Explanatory Note with case Id: " + caseId + " has already been submitted.");
    }
}
