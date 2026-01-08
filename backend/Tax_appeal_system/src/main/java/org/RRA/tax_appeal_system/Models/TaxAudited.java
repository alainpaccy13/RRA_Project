package org.RRA.tax_appeal_system.Models;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TaxAudited {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(unique = true, nullable = false,name = "id")
    private UUID id;

    @Column(nullable = false,name = "audited_tax_type")
    private String auditedTaxType;

    @Column(nullable = false,name = "principal_amount_tobe_paid")
    private double principalAmountToBePaid;

    @Column(nullable = false,name = "understatement_fines")
    private double understatementFines;

    @Column(nullable = false,name = "fixed_administrative_fines")
    private double fixedAdministrativeFines;

    @Column(nullable = false,name = "discharged_amount")
    private double dischargedAmount;

    @Column(nullable = false)
    private double otherFines;

    @Column(nullable = false,name = "total_tax_fines_to_be_paid")
    private double totalTaxAndFinesToBePaid;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "case_id",nullable = false)
    private CaseInfo caseId;

    @OneToMany(mappedBy = "taxAuditedId", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Appeals> appeals = new ArrayList<>();
}
