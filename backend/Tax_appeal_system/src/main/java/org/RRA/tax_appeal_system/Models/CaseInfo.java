package org.RRA.tax_appeal_system.Models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import lombok.*;
import org.RRA.tax_appeal_system.Enums.CaseStatus;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CaseInfo {
    @Id
    @Column(unique = true,nullable = false,name = "case_id")
    private String caseId;

    @Column(nullable = false,name = "auditor_names")
    private String auditorsNames;

    @Column(nullable = false, name = "tax_assessment_acknowledgement_date_by_taxpayer")
    private LocalDate taxAssessmentAcknowledgementDateByTaxpayer;

    @Column(nullable = false,name = "tax_assessment_time")
    private String taxAssessmentTime;

    @Column(nullable = false,name = "appeal_date")
    private LocalDate appealDate;

    @Future
    @Column(nullable = false,name = "appeal_expire_date")
    private LocalDate appealExpireDate;

    @Column(nullable = false, name = "case_presenter")
    private String casePresenter;

    @Column(nullable = false,name = "tin")
    private String tin;

    @Column(nullable = false,name = "attachment_link")
    private String attachmentLink;

    private CaseStatus status;

    private LocalDate preparatorSubmissionDate;

    @OneToMany(mappedBy = "caseId",cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TaxAudited> taxAudited = new ArrayList<>();

    @OneToOne(mappedBy = "caseId",cascade = CascadeType.ALL)
    private MyCases myCases;

}

