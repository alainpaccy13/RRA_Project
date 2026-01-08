package org.RRA.tax_appeal_system.Controllers;

import org.springframework.data.domain.Page;
import lombok.AllArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.responses.AgendaDTO;
import org.RRA.tax_appeal_system.Services.ExplanatoryNoteService;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/v1/agenda")
@AllArgsConstructor
public class AgendaController {
    private final ExplanatoryNoteService explanatoryNoteService;

    @GetMapping("/")
    public ResponseEntity<Page<AgendaDTO>> getAgendaCases(@PageableDefault(page = 0, size = 5) Pageable pageable){
        Page<AgendaDTO> agendaPage = explanatoryNoteService.agenda(pageable);
        return new ResponseEntity<>(agendaPage, HttpStatus.OK);
    }
}
