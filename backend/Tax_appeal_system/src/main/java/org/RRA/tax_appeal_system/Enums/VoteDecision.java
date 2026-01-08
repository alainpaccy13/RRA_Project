package org.RRA.tax_appeal_system.Enums;

public enum VoteDecision {
    WITHBASIS("WithBasis"),
    NOBASIS("NoBasis"),
    ABSTAIN("Abstained");

    private final String displayName;

    VoteDecision(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
