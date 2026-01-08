package org.RRA.tax_appeal_system.Models;


import jakarta.persistence.*;
import lombok.*;
import org.RRA.tax_appeal_system.Enums.CommitteeGroup;
import org.RRA.tax_appeal_system.Enums.Privilege;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@Setter
@Entity
@Table(name = "system_users")
public class UserInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "names")
    private String fullName;
    @Column(unique = true, nullable = false)
    private String email;
    private String title;
    @Column(nullable = false,name = "committee_group")
    @Enumerated(EnumType.STRING)
    private CommitteeGroup committeeGroup;
    @Column(unique = true,name = "phone",nullable = false)
    private String phoneNumber;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Privilege committeeRole;
    @Column(nullable = false)
    private boolean availabilityStatus;

    private String proxyPassword; // Hashed
    private LocalDateTime proxyPasswordExpiry;
}
