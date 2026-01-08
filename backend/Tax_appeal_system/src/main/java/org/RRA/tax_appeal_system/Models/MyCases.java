package org.RRA.tax_appeal_system.Models;

import jakarta.persistence.*;
import lombok.*;
import org.RRA.tax_appeal_system.Enums.CaseStatus;
import java.util.UUID;

@Entity(name = "my_cases")
@Getter
@Setter
@Builder
@AllArgsConstructor
@RequiredArgsConstructor
public class MyCases {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "note_preparator")
    private String notePreparator;

    private CaseStatus status;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "case_id",unique = true, nullable = false)
    private CaseInfo caseId;

}
