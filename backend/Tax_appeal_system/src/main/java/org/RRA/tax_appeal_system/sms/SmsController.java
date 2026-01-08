//package org.RRA.tax_appeal_system.sms;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.RRA.tax_appeal_system.DTOS.responses.GenericResponse;
//
//import jakarta.validation.Valid;
//
///**
// * Controller for sending SMS messages.
// */
//@RestController
//@RequestMapping("/api/v1/sms")
//public class SmsController {
//
//    private final SmsService smsService;
//
//    @Autowired
//    public SmsController(SmsService smsService) {
//        this.smsService = smsService;
//    }
//
//    /**
//     * Send an SMS message using the provided request details.
//     *
//     * @param smsRequest The SMS request containing recipient phone number and message
//     * @return Response indicating success or failure
//     */
//    @PostMapping("/send")
//    public ResponseEntity<GenericResponse<String>> sendSms(@Valid @RequestBody SmsRequest smsRequest) {
//        try {
//            String messageSid = smsService.sendSms(smsRequest);
//
//            GenericResponse<String> response = new GenericResponse<>(
//                    200,
//                    "SMS sent successfully",
//                    messageSid
//            );
//
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            GenericResponse<String> errorResponse = new GenericResponse<>(
//                    500,
//                    "Failed to send SMS: " + e.getMessage(),
//                    null
//            );
//
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//        }
//    }
//
//    /**
//     * Simple endpoint to test sending a predefined SMS message.
//     *
//     * @param phoneNumber The recipient's phone number
//     * @return Response indicating success or failure
//     */
//    @GetMapping("/test")
//    public ResponseEntity<GenericResponse<String>> testSms(@RequestParam String phoneNumber) {
//        try {
//            SmsRequest smsRequest = new SmsRequest(phoneNumber, "Hello from RRA Tax Appeal System! This is a test message.");
//            String messageSid = smsService.sendSms(smsRequest);
//
//            GenericResponse<String> response = new GenericResponse<>(
//                    200,
//                    "Test SMS sent successfully",
//                    messageSid
//            );
//
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            GenericResponse<String> errorResponse = new GenericResponse<>(
//                    500,
//                    "Failed to send test SMS: " + e.getMessage(),
//                    null
//            );
//
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//        }
//    }
//}
