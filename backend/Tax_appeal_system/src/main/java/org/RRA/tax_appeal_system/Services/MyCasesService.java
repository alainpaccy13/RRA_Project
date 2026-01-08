package org.RRA.tax_appeal_system.Services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.DashboardAnalyticsDto;
import org.RRA.tax_appeal_system.DTOS.responses.MyCaseDTO;
import org.RRA.tax_appeal_system.Enums.CaseStatus;
import org.RRA.tax_appeal_system.Enums.CommitteeGroup;
import org.RRA.tax_appeal_system.Models.CaseInfo;
import org.RRA.tax_appeal_system.Models.MyCases;
import org.RRA.tax_appeal_system.Models.UserInfo;
import org.RRA.tax_appeal_system.Repositories.MyCasesRepo;
import org.RRA.tax_appeal_system.Repositories.UserInfoRepo;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;


@Service
@RequiredArgsConstructor
public class MyCasesService {
    private final MyCasesRepo myCasesRepo;
    private final UserInfoRepo userInfoRepo;


    @Transactional
    public List<MyCaseDTO> getMyCasesByPreparator(String notePreparator) {
        List<MyCases> myCasesList = myCasesRepo.findByNotePreparator(notePreparator);

        return myCasesList.stream()
                .map(this::convertToMyCaseDTO)
                .toList();
    }


    public DashboardAnalyticsDto getDashboardAnalytics(String committeeEmail) {
        //finding that User
        UserInfo committee = userInfoRepo.findByEmail(committeeEmail).orElseThrow(()->new UsernameNotFoundException("User with email: "+ committeeEmail + " not found"));
        CommitteeGroup committeeGroup = committee.getCommitteeGroup();

        DashboardAnalyticsDto analytics = new DashboardAnalyticsDto();

        int totalCases = (int) myCasesRepo.count();
        analytics.setTotalCases(totalCases);

        int pendingCases = myCasesRepo.countByStatus(CaseStatus.PENDING);
        analytics.setPendingCases(pendingCases);

        int reviewedCases = myCasesRepo.countReviewedCases();
        double reviewRate = totalCases > 0 ? (reviewedCases * 100.0 / totalCases) : 0.0;
        analytics.setReviewRate(Math.round(reviewRate * 100.0) / 100.0);

        List<Object[]> monthlyData = myCasesRepo.getCaseAnalyticsByMonth();
        List<DashboardAnalyticsDto.CaseAnalyticsData> caseAnalytics = new ArrayList<>();

        for (Object[] data : monthlyData) {
            int month = ((Number) data[0]).intValue();
            long casesWithBasisCount = ((Number) data[1]).longValue();
            long casesWithoutBasisCount = ((Number) data[2]).longValue();

            String monthName = java.time.Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            caseAnalytics.add(new DashboardAnalyticsDto.CaseAnalyticsData(monthName, (int) casesWithBasisCount, (int) casesWithoutBasisCount));
        }
        analytics.setCaseAnalytics(caseAnalytics);
        int totalMembers = userInfoRepo.countAllByCommitteeGroup(committeeGroup);
        int availableMembers = userInfoRepo.countByCommitteeGroupAndAvailabilityStatus(committeeGroup,true);
        analytics.setAttendanceList(
                new DashboardAnalyticsDto.AttendanceData(totalMembers, availableMembers)
        );

        return analytics;
    }

    public List<MyCaseDTO> getCasesForThisWeek() {
        LocalDate startOfWeek = LocalDate.now()
                .with(java.time.DayOfWeek.MONDAY);

        List<MyCases> weekCases = myCasesRepo.findCasesThisWeek(startOfWeek);

        return weekCases.stream()
                .map(this::convertToMyCaseDTO)
                .toList();
    }

    private MyCaseDTO convertToMyCaseDTO(MyCases myCase) {
        CaseInfo caseInfo = myCase.getCaseId();
        LocalDate today = LocalDate.now();
        long daysLeftCalc = 0,daysLeft;
            daysLeftCalc = ChronoUnit.DAYS.between(today, caseInfo.getAppealExpireDate());
            daysLeft = Math.max(daysLeftCalc, 0);

//        long milliseconds = caseInfo.getAppealExpireDate().getTime() - System.currentTimeMillis();
//        int daysLeft = milliseconds > 0 ? (int) (milliseconds / (1000 * 60 * 60 * 24)) : 0;

//        String submittedAt = new SimpleDateFormat("yyyy-MM-dd").format(caseInfo.getAppealDate());
        String submittedAt = caseInfo.getAppealDate().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        return new MyCaseDTO(
                caseInfo.getCaseId(),
                caseInfo.getTin(),
                submittedAt,
                String.valueOf(daysLeft),
                myCase.getStatus()
        );
    }
}