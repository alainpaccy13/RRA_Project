package org.RRA.tax_appeal_system.Services;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Arrays;
import java.util.Date;

@Service
public class GoogleCalendarService {

    public String createEventWithMeetLink(String accessToken) throws IOException {
        Credential credential = new GoogleCredential().setAccessToken(accessToken);
        Calendar service = new Calendar.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance(), credential)
                .setApplicationName("Tax Appeal System")
                .build();

        Event event = new Event()
                .setSummary("Tax Appeal Discussion")
                .setDescription("Meeting to discuss the case details.");

        // Set start and end time (e.g., now for 1 hour)
        long now = System.currentTimeMillis();
        DateTime startDateTime = new DateTime(new Date(now));
        DateTime endDateTime = new DateTime(new Date(now + 3600000)); // 1 hour later

        EventDateTime start = new EventDateTime().setDateTime(startDateTime);
        EventDateTime end = new EventDateTime().setDateTime(endDateTime);
        event.setStart(start);
        event.setEnd(end);


        // --- THIS IS THE CORRECTED SECTION ---
        // The modern way to request a Google Meet link.
        // It's much simpler than the old method.
        ConferenceData conferenceData = new ConferenceData();
        ConferenceSolutionKey conferenceSolutionKey = new ConferenceSolutionKey();
        conferenceSolutionKey.setType("hangoutsMeet"); // This specifies Google Meet

        CreateConferenceRequest createConferenceRequest = new CreateConferenceRequest();
        createConferenceRequest.setRequestId("random-string-" + now); // A unique ID
        createConferenceRequest.setConferenceSolutionKey(conferenceSolutionKey);

        conferenceData.setCreateRequest(createConferenceRequest);
        event.setConferenceData(conferenceData);
        // --- END OF CORRECTION ---

        String calendarId = "primary"; // Use the user's primary calendar
        try {
            event = service.events().insert(calendarId, event)
                    .setConferenceDataVersion(1)
                    .execute();
            System.out.println("Google Meet created successfully: " + event.getHangoutLink());
            return event.getHangoutLink();
        } catch (Exception e) {  // Catch Exception to be safe
            System.err.println("GOOGLE API ERROR: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();  // Full stack trace
            throw e;  // Re-throw so controller catches it
        }
    }
}