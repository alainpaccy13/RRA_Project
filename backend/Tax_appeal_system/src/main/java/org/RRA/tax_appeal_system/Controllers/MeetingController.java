package org.RRA.tax_appeal_system.Controllers;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.RRA.tax_appeal_system.Enums.CommitteeGroup;
import org.RRA.tax_appeal_system.Models.UserInfo;
import org.RRA.tax_appeal_system.Repositories.UserInfoRepo;
import org.RRA.tax_appeal_system.Services.GoogleCalendarService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/meetings")
public class MeetingController {

    private final GoogleCalendarService calendarService;
    private final UserInfoRepo userInfoRepo;
    private final JavaMailSender mailSender;

    // Constructor injection (keep only this — remove OAuth2AuthorizedClientService)
    public MeetingController(GoogleCalendarService calendarService, UserInfoRepo userInfoRepo, JavaMailSender mailSender) {
        this.calendarService = calendarService;
        this.userInfoRepo = userInfoRepo;
        this.mailSender = mailSender;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createMeeting(
            @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient, Principal principal) {

        System.out.println("Entering createMeeting - Authorized client exists: " + (authorizedClient != null));

        if (authorizedClient == null || authorizedClient.getAccessToken() == null) {
            System.out.println("Authorized client or access token is null - Returning 401");
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not authenticated with Google. Please sign in.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        String accessToken = authorizedClient.getAccessToken().getTokenValue();
        System.out.println("Access token retrieved: " + accessToken);  // This will print the token (sensitive, so remove later)

        Map<String, String> response = new HashMap<>();
        try {
            String committeeLeaderEmail = principal.getName();
            String meetLink = calendarService.createEventWithMeetLink(accessToken);

            response.put("meetLink", meetLink);
//            // so now here we will try to send the meeting link to everyone's email in that committee group
//            UserInfo user = userInfoRepo.findByEmail(committeeLeaderEmail).orElseThrow(()->new UsernameNotFoundException("User with " + committeeLeaderEmail + " not found"));
//            CommitteeGroup committeeGroup = user.getCommitteeGroup();
//            //Now we get the list of users in the same committee group
//            List<UserInfo> usersList = userInfoRepo.findAllByCommitteeGroupAndAvailabilityStatus(committeeGroup,true);
//
//            //prepare for sending Email
//            MimeMessage message = mailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
//
//            for(UserInfo committee : usersList) {
//                helper.setTo(committee.getEmail());
//                helper.setSubject("Google Meeting Link");
//                helper.setText(meetLink);
//                mailSender.send(message);
//            }

            return ResponseEntity.ok(response);
        }catch (IOException e) {
                System.err.println("Controller caught IOException: " + e.getMessage());
                e.printStackTrace();
                response.put("error", "Failed to create Google Meet: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
//        catch (MessagingException e) {
//            throw new RuntimeException(e);
//        }
    }


}