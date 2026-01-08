package org.RRA.tax_appeal_system.Models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class MeetingInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;
    @Column(nullable = false,name = "meeting_venue")
    String meetingVenue;
    @Column(nullable = false)
    LocalTime meetingTime;

}
