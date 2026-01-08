package org.RRA.tax_appeal_system.Email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class EmailDetails {

    private String recipient;
    private String msgBody;
    private String subject;
    private String attachment;
}
