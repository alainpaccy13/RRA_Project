package org.RRA.tax_appeal_system.Email;


import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.Enums.CommitteeGroup;
import org.RRA.tax_appeal_system.Models.MeetingInfo;
import org.RRA.tax_appeal_system.Models.UserInfo;
import org.RRA.tax_appeal_system.Repositories.MeetingInfoRepo;
import org.RRA.tax_appeal_system.Services.UserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;


@Service
@RequiredArgsConstructor
public class EmailServiceImpl {

        private final JavaMailSender mailSender;
    private final UserInfoService userInfoService;
    private final TemplateEngine templateEngine;
    private final MeetingInfoRepo meetingInfoRepo;
    @Value("${spring.mail.username}") private String sender;

    @Scheduled(cron = "0 0 8 * * 2 ")
    public void sendAppealsMeetingEmail() {
        try {
            Integer meetingInfoId = 1;
            MeetingInfo meetingInfo = meetingInfoRepo.findById(meetingInfoId).orElseThrow(()->new RuntimeException("MeetingInfo not found"));
            LocalTime meetingHour = meetingInfo.getMeetingTime();
            String venue = meetingInfo.getMeetingVenue() ;

            // getting Users to send the invitation to
            List<UserInfo> users = userInfoService.getUsersByCommitteeGroup(CommitteeGroup.APPEAL_COMMITTEE);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Calculate next Thursday
            String nextThursday = getNextThursday();
            String formattedDate = formatDateForDisplay(nextThursday);

            for(UserInfo user : users) {


                // Set email basics
                helper.setTo(user.getEmail());
                helper.setSubject("Invitation: Appeals Committee Meeting - " + formattedDate);

                // Prepare Thymeleaf context
                Context context = new Context();
                context.setVariable("name", user.getFullName());
                context.setVariable("subject", "Invitation: Appeals Committee Meeting");
                context.setVariable("meetingDate", formattedDate);
                context.setVariable("meetingHour", meetingHour);
                context.setVariable("venue", venue);

                // Process HTML template
                String htmlContent = templateEngine.process("invitationEmail", context);
                helper.setText(htmlContent, true);

                mailSender.send(message);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email" + e.getMessage());
        }
    }

    /**
     * Calculate the date of the next upcoming Thursday
     */
    private String getNextThursday() {
        LocalDate today = LocalDate.now();
        LocalDate nextThursday = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.THURSDAY));

        // If today is Thursday, use next Thursday instead of today
        if (nextThursday.isEqual(today)) {
            nextThursday = today.with(TemporalAdjusters.next(DayOfWeek.THURSDAY));
        }

        return nextThursday.toString(); // Returns in format: 2023-12-14
    }

    /**
     * Format the date for nice display (e.g., "Thursday, December 14, 2023")
     */
    private String formatDateForDisplay(String dateString) {
        LocalDate date = LocalDate.parse(dateString);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy");
        return date.format(formatter);
    }

}
