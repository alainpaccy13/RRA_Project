package org.RRA.tax_appeal_system.Controllers;


import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.Services.UserInfoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/committee")
@RequiredArgsConstructor
public class CommitteeController {

    private final UserInfoService userInfoService; // or your service name

    @GetMapping("/members-availability")
    public ResponseEntity<List<UserInfoService.MemberAvailabilityDTO>> getMembersAvailability(
            Principal principal) {

        String email = principal.getName(); // assuming email is principal
        List<UserInfoService.MemberAvailabilityDTO> members = userInfoService
                .getAllMemberAndTheirAvailabilityStatus(email);

        return ResponseEntity.ok(members);
    }

    @PutMapping("/member/{userId}/availability")
    public ResponseEntity<Void> updateMemberAvailability(
            @PathVariable UUID userId,
            @RequestBody Map<String, Boolean> body, // { "availabilityStatus": true }
            Principal principal) {

        boolean status = body.getOrDefault("availabilityStatus", false);
        userInfoService.updateMemberAvailabilityAsLeader(principal.getName(), userId, status);

        return ResponseEntity.ok().build();
    }
}
