package org.RRA.tax_appeal_system.Email;

import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.Models.MeetingInfo;
import org.RRA.tax_appeal_system.Repositories.MeetingInfoRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MeetingInfoService {
    private final MeetingInfoRepo meetingInfoRepo;

    @Transactional
    public String insertMeetingVenueAndTime(String venue,LocalTime meetingTime) {
        MeetingInfo meetingInfo = MeetingInfo.builder().meetingVenue(venue).meetingTime(meetingTime).build();
        meetingInfoRepo.save(meetingInfo);
        return "Meeting Info Inserted";
    }

    @Transactional
    public String updateMeetingVenueAndTime(Integer id,String venue,LocalTime meetingTime) {
    MeetingInfo meetingInfo = meetingInfoRepo.findById(id).orElseThrow(()->new IllegalArgumentException("Meeting Information with ID: " +id+" not found"));
    meetingInfo.setMeetingVenue(venue);
    meetingInfo.setMeetingTime(meetingTime);
    meetingInfoRepo.save(meetingInfo);
    return "Meeting Info Updated";
    }
}