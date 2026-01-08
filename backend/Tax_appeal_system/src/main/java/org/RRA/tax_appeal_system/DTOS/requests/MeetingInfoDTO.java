package org.RRA.tax_appeal_system.DTOS.requests;

import java.time.LocalTime;

public record MeetingInfoDTO(
        LocalTime meetingTime,
        String venue
) {
}
