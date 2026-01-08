package org.RRA.tax_appeal_system.Exceptions;

public class CaseNotFoundException extends RuntimeException {
    public CaseNotFoundException(String message) {
        super(message);
    }
}
