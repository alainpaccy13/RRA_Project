package org.RRA.tax_appeal_system.Controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.responses.ExplanatoryNoteDTO;
import org.RRA.tax_appeal_system.DTOS.responses.ExplanatoryNoteResponseDTO;
import org.RRA.tax_appeal_system.DTOS.responses.GenericResponse;
import org.RRA.tax_appeal_system.Services.ExplanatoryNoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@Tag(name = " Explanatory Note Related APIs")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth/explanatory_note/")
public class ExplanatoryController {
    private final ExplanatoryNoteService explanatoryNoteService;

    @Operation(summary = " Generating a new Explanatory Note")
    @PostMapping("/")
    public ResponseEntity<GenericResponse<String>> createExplanatoryNote(@RequestBody ExplanatoryNoteDTO explanatoryNote, Principal principal) {
        explanatoryNoteService.generateExplanatoryNote(explanatoryNote,principal.getName());
        GenericResponse<String> response = new GenericResponse<>(
                HttpStatus.CREATED.value(),
                "succesfully Registered new explanatory Note",
                null
        );
         return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = " Get Explanatory note by CaseId")
    @GetMapping("/{caseId}")
    public ResponseEntity<GenericResponse<ExplanatoryNoteResponseDTO>> getExplanatoryNoteByCaseId(
            @PathVariable String caseId) {

        ExplanatoryNoteResponseDTO explanatoryNote = explanatoryNoteService.getExplanatoryNoteByCaseId(caseId);
            return ResponseEntity.ok(new GenericResponse<>(
                    200,
                    "Explanatory note retrieved successfully",
                    explanatoryNote
            ));
    }

    @PutMapping("/{caseId}")
    public ResponseEntity<GenericResponse<String>> updateExplanatoryNote(@PathVariable String caseId, @RequestBody ExplanatoryNoteDTO explanatoryNote, Principal principal) {
        explanatoryNoteService.updatingExplanatoryNoteByCaseId(caseId, explanatoryNote, principal.getName());
        GenericResponse<String> response = new GenericResponse<>(
                HttpStatus.OK.value(),
                "Updated Note successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Save note without changing status")
    @PutMapping("/{caseId}/save")
    public ResponseEntity<GenericResponse<String>> saveNote(@PathVariable String caseId, @RequestBody ExplanatoryNoteDTO explanatoryNote, Principal principal) {
        explanatoryNoteService.saveNote(caseId, explanatoryNote, principal.getName());
        GenericResponse<String> response = new GenericResponse<>(
                HttpStatus.OK.value(),
                "Note saved successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Move note to pre-appeal")
    @PostMapping("/{caseId}/move-to-pre-appeal")
    public ResponseEntity<GenericResponse<String>> moveToPreAppeal(@PathVariable String caseId) {
        explanatoryNoteService.moveToPreAppeal(caseId);

        GenericResponse<String> response = new GenericResponse<>(
                HttpStatus.OK.value(),
                "Note moved to pre-appeal successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{caseId}")
    public ResponseEntity<String> DeleteExplanatoryNote(@PathVariable String caseId) {
        explanatoryNoteService.deleteExplanatoryNoteByCaseId(caseId);
    return ResponseEntity.ok("DELETED NOTE Successfully");
    };

    @PostMapping("/appeal/comment/{appealId}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getCommentForAppealPoint(@PathVariable UUID appealId) {
        String comment  = explanatoryNoteService.getCommentOnAppealPoint(appealId);

        if (comment == null) {
            return ResponseEntity.ok(Map.of("message", "No comments found for this appeal."));
        }
        return ResponseEntity.ok(Map.of("comment", comment));
    }



}
