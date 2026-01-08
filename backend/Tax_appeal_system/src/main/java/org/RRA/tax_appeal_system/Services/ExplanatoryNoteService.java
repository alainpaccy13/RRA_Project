package org.RRA.tax_appeal_system.Services;

import org.RRA.tax_appeal_system.Models.*;
import org.RRA.tax_appeal_system.Repositories.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.requests.AppealDetailsDTO;
import org.RRA.tax_appeal_system.DTOS.requests.AuditedTaxDTO;
import org.RRA.tax_appeal_system.DTOS.responses.*;
import org.RRA.tax_appeal_system.Enums.CaseStatus;
import org.RRA.tax_appeal_system.Exceptions.CaseNotFoundException;
import org.RRA.tax_appeal_system.Exceptions.DuplicateCaseSubmissionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;


import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExplanatoryNoteService {

    private final CaseInfoRepo caseInfoRepo;
    private final MyCasesRepo myCasesRepo;
    private final AppealsRepo appealsRepo;
    private final TaxAuditedRepo taxAuditedRepo;
    private final UserInfoRepo userInfoRepo;
    private final CommitteeVoteRepository committeeVoteRepository;
    // logger used with logs that helps with Auditing
    private static final Logger logger = LoggerFactory.getLogger(ExplanatoryNoteService.class);

    //EXPLANATORY NOTE
    //Generating a new explanatory note
    @Transactional
    public void generateExplanatoryNote(ExplanatoryNoteDTO explanatoryNote,String notePreparatorEmail) {
        LocalDate now = LocalDate.now();
        // Check if an explanatory note wit the same case Id it was not submitted already
        if(caseInfoRepo.existsByCaseId(explanatoryNote.caseId())) {
            throw new DuplicateCaseSubmissionException(explanatoryNote.caseId());
        }


        // saving for Case Info
        CaseInfo caseInfoEntity = CaseInfo.builder()
                .caseId(explanatoryNote.caseId())
                .auditorsNames(explanatoryNote.auditorsName())
                .taxAssessmentAcknowledgementDateByTaxpayer(explanatoryNote.taxAssessmentAcknowledgementDateByTaxpayer())
                .taxAssessmentTime(explanatoryNote.taxAssessmentTime())
                .appealDate(explanatoryNote.appealDate())
                .appealExpireDate(explanatoryNote.appealExpireDate())
                .casePresenter(explanatoryNote.casePresenter())
                .status(CaseStatus.SUBMITTED)  // Changed from PRE_APPEAL to SUBMITTED
                .preparatorSubmissionDate(now)
                .tin(explanatoryNote.tin())
                .attachmentLink(explanatoryNote.attachmentLink())
                .build();

        CaseInfo savedCaseInfo = caseInfoRepo.save(caseInfoEntity);


        //Saving for audited Tax by mapping through them
        for (AuditedTaxDTO auditedTaxDTO: explanatoryNote.taxAudited()) {

            TaxAudited taxAuditedEntity = TaxAudited.builder()
                    .auditedTaxType(auditedTaxDTO.taxTypeAudited())
                    .principalAmountToBePaid(auditedTaxDTO.principalAmountToBePaid())
                    .understatementFines(auditedTaxDTO.understatementFines())
                    .fixedAdministrativeFines(auditedTaxDTO.fixedAdministrativeFines())
                    .dischargedAmount(auditedTaxDTO.dischargedAmount())
                    .otherFines(auditedTaxDTO.otherFines())
                    .totalTaxAndFinesToBePaid(auditedTaxDTO.totalTaxAndFinesToBePaid())
                    .caseId(savedCaseInfo)
                    .build();

            TaxAudited savedTaxAudited = taxAuditedRepo.save(taxAuditedEntity);


            //saving for appeals by mapping through them
            for (AppealDetailsDTO appealDetailsDTO : auditedTaxDTO.appeals()){
                Appeals appealsEntity =  Appeals.builder()
                        .appealPoint(appealDetailsDTO.appealPoint())
                        .summarisedProblem(appealDetailsDTO.summarisedProblem())
                        .auditorsOpinion(appealDetailsDTO.auditorsOpinion())
                        .proposedSolution(appealDetailsDTO.proposedSolution())
                        .taxAuditedId(savedTaxAudited)
                        .build();


                appealsRepo.save(appealsEntity);
            }
        }

        // saving in MyCases Entity
        saveMyCases(explanatoryNote.caseId(), notePreparatorEmail);

    }

    @Transactional
    // Getting Explanatory note by caseId
    public ExplanatoryNoteResponseDTO getExplanatoryNoteByCaseId(String caseId) {
        // Find the case info by caseId
        CaseInfo caseInfo = caseInfoRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found"));

        // Find all tax audited records for this case
        List<TaxAudited> taxAuditedList = taxAuditedRepo.findByCaseId(caseInfo);

        // Convert to DTOs
        List<TaxAuditedDTO> taxAuditedDTOs = taxAuditedList.stream()
                .map(this::convertToAuditedTaxDTO)
                .collect(Collectors.toList());

        // Build and return the main explanatory note response
        return new ExplanatoryNoteResponseDTO(
                caseInfo.getCaseId(),
                caseInfo.getAuditorsNames(),
                caseInfo.getTaxAssessmentAcknowledgementDateByTaxpayer(),
                caseInfo.getTaxAssessmentTime(),
                caseInfo.getAppealDate(),
                caseInfo.getAppealExpireDate(),
                caseInfo.getCasePresenter(),
                caseInfo.getTin(),
                caseInfo.getAttachmentLink(),
                caseInfo.getStatus(),
                caseInfo.getPreparatorSubmissionDate(),
                taxAuditedDTOs
        );
    }

    private TaxAuditedDTO convertToAuditedTaxDTO(TaxAudited taxAudited) {
        // Find all appeals for this tax audited record
        List<Appeals> appealsList = appealsRepo.findByTaxAuditedId(taxAudited);

        // Convert appeals to DTOs
        List<AppealDTO> appealDTOs = appealsList.stream()
                .map(this::convertToAppealDetailsDTO)
                .collect(Collectors.toList());

        return new TaxAuditedDTO(
                taxAudited.getId(),
                taxAudited.getAuditedTaxType(),
                taxAudited.getPrincipalAmountToBePaid(),
                taxAudited.getUnderstatementFines(),
                taxAudited.getFixedAdministrativeFines(),
                taxAudited.getDischargedAmount(),
                taxAudited.getOtherFines(),
                taxAudited.getTotalTaxAndFinesToBePaid(),
                appealDTOs
        );
    }

    private AppealDTO convertToAppealDetailsDTO(Appeals appeal) {
        return new AppealDTO(
                appeal.getAppealId(),
                appeal.getAppealPoint(),
                appeal.getSummarisedProblem(),
                appeal.getAuditorsOpinion(),
                appeal.getProposedSolution()

        );
    }

    @Transactional
    public void deleteExplanatoryNoteByCaseId(String caseId) {


            // finding CaseInfo with that CaseId
            CaseInfo caseInfo = caseInfoRepo.findByCaseId(caseId).orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found"));

            //finding All Related Tax Audited
            List<TaxAudited> taxAuditedList = taxAuditedRepo.findByCaseId(caseInfo);

            for (TaxAudited taxAudited : taxAuditedList) {
                List<Appeals> appeals = appealsRepo.findByTaxAuditedId(taxAudited);
                //deleted All Appeals in Each taxAudited
                appealsRepo.deleteAll(appeals);
            }

            //Deleting Tax Audited
            taxAuditedRepo.deleteAll(taxAuditedList);

            //we have to delete the Records in My Cases with the caseInfo with the provided ID
            if (caseInfo.getMyCases() != null) {
                MyCases case1 = myCasesRepo.findByCaseId(caseInfo.getCaseId()).orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseInfo + " not found in My Cases Entity"));
                myCasesRepo.delete(case1);
            }

            // finally deleting Case Info
             caseInfoRepo.delete(caseInfo);
    }

    @Transactional
    public void updatingExplanatoryNoteByCaseId(String caseId,ExplanatoryNoteDTO newExplanatoryNote,String notePreparator) {
        // Find the case
        CaseInfo caseInfo = caseInfoRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found in My Cases Entity"));

        // Get the current status
        CaseStatus currentStatus = caseInfo.getStatus();

        // Deleting the Existing Explanatory Note
        deleteExplanatoryNoteByCaseId(caseId);

        // Registering new Note
        generateExplanatoryNote(newExplanatoryNote, notePreparator);

        // Restore the original status
        CaseInfo updatedCaseInfo = caseInfoRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found"));
        updatedCaseInfo.setStatus(currentStatus);
        caseInfoRepo.save(updatedCaseInfo);

        // Update the status in MyCases as well
        MyCases myCases = myCasesRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found in My Cases"));
        myCases.setStatus(currentStatus);
        myCasesRepo.save(myCases);
    }



    // MY CASES
    @Transactional
    public void saveMyCases(String caseId,String email){
        CaseInfo caseInfo = caseInfoRepo.findByCaseId(caseId).orElseThrow();

        // saving also in myCases Entity
        MyCases myCasesEntity = MyCases.builder()
                .caseId(caseInfo)
                .notePreparator(email)
                .status(CaseStatus.SUBMITTED)  // Using SUBMITTED as the initial status
                .build();
        myCasesRepo.save(myCasesEntity);
    }

    //AGENDA

    public Page<AgendaDTO> agenda(Pageable pageable) {
        // Fetch cases with READY_FOR_AGENDA, PENDING, or RESOLVED status with pagination
        // This ensures cases remain in the Agenda even after resolution
        List<CaseStatus> agendaStatuses = Arrays.asList(CaseStatus.READY_FOR_AGENDA, CaseStatus.PENDING, CaseStatus.RESOLVED);
        Page<CaseInfo> allCases = caseInfoRepo.findByStatusIn(agendaStatuses, pageable);

        List<AgendaDTO> agendaDTOList = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Process each case in the current page
        for(CaseInfo caseInfo : allCases.getContent()){


            // Calculate days left
            long daysLeft = 0;
            if (caseInfo.getAppealExpireDate() != null) {
                daysLeft = ChronoUnit.DAYS.between(today, caseInfo.getAppealExpireDate());
                daysLeft = Math.max(daysLeft, 0);
            }

            // Calculate tax amounts
            List<TaxAudited> taxAuditedList = taxAuditedRepo.findByCaseId(caseInfo);
            double amountDischarged = 0;
            double taxOriginallyAssessed = 0;

            for (TaxAudited taxAudited : taxAuditedList){
                amountDischarged += taxAudited.getDischargedAmount();
                taxOriginallyAssessed += taxAudited.getTotalTaxAndFinesToBePaid();
            }

            double taxToBePaid = taxOriginallyAssessed - amountDischarged;
            if (taxToBePaid < 0) {
                throw new ArithmeticException("Tax To Be Paid can't be Negative");
            }

            // Create DTO
            AgendaDTO agendaDTO = new AgendaDTO(
                    caseInfo.getCaseId(),
                    "taxPayerName", // hardcoded
                    caseInfo.getCasePresenter(),
                    caseInfo.getTin(),
                    caseInfo.getStatus(),
                    daysLeft,
                    caseInfo.getAppealDate(),
                    amountDischarged,
                    taxToBePaid,
                    caseInfo.getAuditorsNames()
            );

            agendaDTOList.add(agendaDTO);
        }

        // Sort by daysLeft (ascending - cases with least days left first)
        agendaDTOList.sort(Comparator.comparingLong(AgendaDTO::daysLeft));
        agendaDTOList.sort(
                // 1. Primary Sort: Sort by Status
                Comparator.comparing((AgendaDTO agenda) -> agenda.caseStatus() != CaseStatus.PENDING)
                        // 2. Secondary Sort: Sort by daysLeft
                        .thenComparingLong(AgendaDTO::daysLeft)
        );

        // Return proper Page implementation
        return new PageImpl<>(
                agendaDTOList,
                pageable,
                allCases.getTotalElements()
        );
    }
    public String getCommentOnAppealPoint(UUID appealId) {
        List<CommitteeVote> votes = committeeVoteRepository.findByAppeal_AppealId(appealId);

        if (votes.isEmpty()) {
            return null;  // No votes found for this appeal
        }

        StringBuilder commentsBuilder = new StringBuilder();

        for (CommitteeVote vote : votes) {
            String comment = vote.getVoteComment();
            if (comment != null && !comment.trim().isEmpty()) {
                if (commentsBuilder.length() > 0) {
                    commentsBuilder.append("\n\n");  // Separate multiple comments with new lines
                }
                commentsBuilder.append(comment);
            }
        }

        String finalComments = commentsBuilder.toString().trim();
        return finalComments.isEmpty() ? null : finalComments;
    }

    // PRE-APPEAL METHODS

    /**
     * Get all cases in pre-appeal status
     */
    public Page<AgendaDTO> getPreAppealCases(Pageable pageable, String preparatorEmail) {

        // CHANGED: Use the custom query that filters by Email AND Status
        Page<CaseInfo> preAppealCases = caseInfoRepo.findByStatusAndPreparator(
                CaseStatus.PRE_APPEAL,
                preparatorEmail,
                pageable
        );

        List<AgendaDTO> agendaDTOList = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Process each case (logic remains the same)
        for(CaseInfo caseInfo : preAppealCases.getContent()){
            long daysLeft = 0;
            if (caseInfo.getAppealExpireDate() != null) {
                daysLeft = ChronoUnit.DAYS.between(today, caseInfo.getAppealExpireDate());
                daysLeft = Math.max(daysLeft, 0);
            }

            List<TaxAudited> taxAuditedList = taxAuditedRepo.findByCaseId(caseInfo);
            double amountDischarged = 0;
            double taxOriginallyAssessed = 0;

            for (TaxAudited taxAudited : taxAuditedList){
                amountDischarged += taxAudited.getDischargedAmount();
                taxOriginallyAssessed += taxAudited.getTotalTaxAndFinesToBePaid();
            }

            double taxToBePaid = taxOriginallyAssessed - amountDischarged;

            AgendaDTO agendaDTO = new AgendaDTO(
                    caseInfo.getCaseId(),
                    "taxPayerName",
                    caseInfo.getCasePresenter(),
                    caseInfo.getTin(),
                    caseInfo.getStatus(),
                    daysLeft,
                    caseInfo.getAppealDate(),
                    amountDischarged,
                    taxToBePaid,
                    caseInfo.getAuditorsNames()
            );

            agendaDTOList.add(agendaDTO);
        }

        agendaDTOList.sort(Comparator.comparingLong(AgendaDTO::daysLeft));

        return new PageImpl<>(
                agendaDTOList,
                pageable,
                preAppealCases.getTotalElements()
        );
    }
    /**
     * Move a case from pre-appeal to agenda
     */
    @Transactional
    public void moveToAgenda(String caseId) {
        // Find the case
        CaseInfo caseInfo = caseInfoRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found"));

        // Check if the case is in pre-appeal status
        if (caseInfo.getStatus() != CaseStatus.PRE_APPEAL) {
            throw new IllegalStateException("Case is not in PRE_APPEAL status");
        }

        // Update the status to READY_FOR_AGENDA
        caseInfo.setStatus(CaseStatus.READY_FOR_AGENDA);
        caseInfoRepo.save(caseInfo);

        // Update the status in MyCases as well
        MyCases myCases = myCasesRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found in My Cases"));
        myCases.setStatus(CaseStatus.READY_FOR_AGENDA);
        myCasesRepo.save(myCases);
    }

    /**
     * Save updated note without changing status
     */
    @Transactional
    public void saveNote(String caseId, ExplanatoryNoteDTO explanatoryNote, String notePreparator) {
        // Find the case
        CaseInfo caseInfo = caseInfoRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found"));

        // Get the current status
        CaseStatus currentStatus = caseInfo.getStatus();

        // Delete the existing note
        deleteExplanatoryNoteByCaseId(caseId);

        // Generate a new note
        generateExplanatoryNote(explanatoryNote, notePreparator);

        // Restore the original status
        CaseInfo updatedCaseInfo = caseInfoRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found"));
        updatedCaseInfo.setStatus(currentStatus);
        caseInfoRepo.save(updatedCaseInfo);

        // Update the status in MyCases as well
        MyCases myCases = myCasesRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found in My Cases"));
        myCases.setStatus(currentStatus);
        myCasesRepo.save(myCases);
    }

    /**
     * Move a case to pre-appeal status
     */
    @Transactional
    public void moveToPreAppeal(String caseId) {
        // Find the case
        CaseInfo caseInfo = caseInfoRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found"));

        // Update the status to PRE_APPEAL
        caseInfo.setStatus(CaseStatus.PRE_APPEAL);
        caseInfoRepo.save(caseInfo);

        // Update the status in MyCases as well
        MyCases myCases = myCasesRepo.findByCaseId(caseId)
                .orElseThrow(() -> new CaseNotFoundException("Case with ID " + caseId + " not found in My Cases"));
        myCases.setStatus(CaseStatus.PRE_APPEAL);
        myCasesRepo.save(myCases);
    }

}
