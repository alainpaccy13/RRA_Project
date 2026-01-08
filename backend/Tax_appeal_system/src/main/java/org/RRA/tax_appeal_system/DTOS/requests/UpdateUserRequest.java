package org.RRA.tax_appeal_system.DTOS.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import org.RRA.tax_appeal_system.Enums.CommitteeGroup;
import org.RRA.tax_appeal_system.Enums.Privilege;

public record UpdateUserRequest(
        @Size(min = 3,message = "full names must not go under 3 characters")
        String fullName,
        @Email(message = "please provide a valid email")
        String email,
        String title,
        Privilege committee_role ,
        CommitteeGroup committeeGroup,
        @Size(min = 10,max = 12,message = "Phone number are incomplete")
        String phoneNumber
) {
}
