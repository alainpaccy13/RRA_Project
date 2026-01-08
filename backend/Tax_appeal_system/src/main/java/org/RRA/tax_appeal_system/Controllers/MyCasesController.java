package org.RRA.tax_appeal_system.Controllers;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.DashboardAnalyticsDto;
import org.RRA.tax_appeal_system.DTOS.responses.GenericResponse;
import org.RRA.tax_appeal_system.DTOS.responses.MyCaseDTO;
import org.RRA.tax_appeal_system.Services.MyCasesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/my-cases")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class MyCasesController {

    private final MyCasesService myCasesService;

    @GetMapping("/my-cases")
    public ResponseEntity<GenericResponse<List<MyCaseDTO>>> getMyCases(Principal principal) {
        try {
            String notePreparator = principal.getName(); // Assuming email is the preparator
            List<MyCaseDTO> myCases = myCasesService.getMyCasesByPreparator(notePreparator);

            GenericResponse<List<MyCaseDTO>> response = new GenericResponse<>(
                    200,
                    "My cases retrieved successfully",
                    myCases
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            GenericResponse<List<MyCaseDTO>> errorResponse = new GenericResponse<>(
                    500,
                    "Error retrieving my cases: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @GetMapping("/analytics")
    public ResponseEntity<GenericResponse<DashboardAnalyticsDto>> getDashboardAnalytics(Principal principal) {
        try {
            String committeeEmail = principal.getName();
            DashboardAnalyticsDto analytics = myCasesService.getDashboardAnalytics(committeeEmail);
            GenericResponse<DashboardAnalyticsDto> response = new GenericResponse<>(
                    200,
                    "Dashboard analytics retrieved successfully",
                    analytics
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            GenericResponse<DashboardAnalyticsDto> errorResponse = new GenericResponse<>(
                    500,
                    "Error retrieving dashboard analytics: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @GetMapping("/this-week")
    public ResponseEntity<GenericResponse<List<MyCaseDTO>>> getCasesForThisWeek() {
        try {
            List<MyCaseDTO> weekCases = myCasesService.getCasesForThisWeek();

            GenericResponse<List<MyCaseDTO>> response = new GenericResponse<>(
                    200,
                    "This week's cases retrieved successfully",
                    weekCases
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            GenericResponse<List<MyCaseDTO>> errorResponse = new GenericResponse<>(
                    500,
                    "Error retrieving this week's cases: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }}