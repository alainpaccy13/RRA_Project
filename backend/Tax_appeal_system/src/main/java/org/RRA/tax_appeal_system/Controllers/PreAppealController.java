package org.RRA.tax_appeal_system.Controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.responses.AgendaDTO;
import org.RRA.tax_appeal_system.DTOS.responses.GenericResponse;
import org.RRA.tax_appeal_system.Services.ExplanatoryNoteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal; // Import Principal

@RestController
@Tag(name = "Pre-Appeal Related APIs")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth/pre-appeal/")
public class PreAppealController {
    private final ExplanatoryNoteService explanatoryNoteService;

    @Operation(summary = "Get my pre-appeal cases")
    @GetMapping("/")
    public ResponseEntity<GenericResponse<Page<AgendaDTO>>> getPreAppealCases(
            Pageable pageable,
            Principal principal // 1. Inject Principal
    ) {
        // 2. Pass the principal's name (email) to the service
        Page<AgendaDTO> preAppealCases = explanatoryNoteService.getPreAppealCases(pageable, principal.getName());

        GenericResponse<Page<AgendaDTO>> response = new GenericResponse<>(
                HttpStatus.OK.value(),
                "My Pre-appeal cases retrieved successfully",
                preAppealCases
        );
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Move a case from pre-appeal to agenda")
    @PostMapping("/{caseId}/move-to-agenda")
    public ResponseEntity<GenericResponse<String>> moveToAgenda(@PathVariable String caseId) {
        explanatoryNoteService.moveToAgenda(caseId);
        GenericResponse<String> response = new GenericResponse<>(
                HttpStatus.OK.value(),
                "Case moved to agenda successfully",
                null
        );
        return ResponseEntity.ok(response);
    }
}