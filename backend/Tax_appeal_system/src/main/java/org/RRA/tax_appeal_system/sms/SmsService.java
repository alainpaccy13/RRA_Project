//package org.RRA.tax_appeal_system.sms;
//
//import com.twilio.Twilio;
//import com.twilio.rest.api.v2010.account.Message;
//import com.twilio.type.PhoneNumber;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import jakarta.annotation.PostConstruct;
//
///**
// * Service for sending SMS messages using Twilio.
// */
//@Service
//public class SmsService {
//
//    @Value("${twilio.account.sid}")
//    private String twilioAccountSid;
//
//    @Value("${twilio.auth.token}")
//    private String twilioAuthToken;
//
//    @Value("${twilio.phone.number}")
//    private String twilioPhoneNumber;
//
//    /**
//     * Initialize Twilio with account credentials.
//     */
//    @PostConstruct
//    private void initTwilio() {
//        Twilio.init(twilioAccountSid, twilioAuthToken);
//    }
//
//    /**
//     * Send an SMS message to the specified phone number.
//     *
//     * @param smsRequest The SMS request containing the recipient phone number and message
//     * @return The SID of the sent message
//     */
//    public String sendSms(SmsRequest smsRequest) {
//        Message message = Message.creator(
//                new PhoneNumber(smsRequest.getPhoneNumber()),
//                new PhoneNumber(twilioPhoneNumber),
//                smsRequest.getMessage()
//        ).create();
//
//        return message.getSid();
//    }
//}