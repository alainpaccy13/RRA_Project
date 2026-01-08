package org.RRA.tax_appeal_system.Controllers;

import org.RRA.tax_appeal_system.DTOS.requests.MeetingInfoDTO;
import org.RRA.tax_appeal_system.DTOS.responses.GenericResponse;
import org.RRA.tax_appeal_system.Email.MeetingInfoService;
import org.RRA.tax_appeal_system.Models.MeetingInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/meeting-info")
public class MeetingInfoContoller {
    @Autowired
    MeetingInfoService meetingInfoService;
    @PostMapping
    @PreAuthorize("hasRole('COMMITTEE_LEADER')")
    public ResponseEntity<String> provideMeetingInfo(@RequestBody MeetingInfoDTO meetingInfo) {
        meetingInfoService.insertMeetingVenueAndTime(meetingInfo.venue(), meetingInfo.meetingTime());
        return ResponseEntity.ok().body("Meeting Info inserted successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMMITTEE_LEADER')")
    public ResponseEntity<String> updateMeetingInfo(@PathVariable int id, @RequestBody MeetingInfoDTO meetingInfo) {
        String updated = meetingInfoService.updateMeetingVenueAndTime(id, meetingInfo.venue(), meetingInfo.meetingTime());
        return ResponseEntity.ok().body(updated);
    }
}
