package org.RRA.tax_appeal_system.DTOS;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsDto {
    private int totalCases;
    private double reviewRate;
    private int pendingCases;
    private List<CaseAnalyticsData> caseAnalytics;
    private AttendanceData attendanceList;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaseAnalyticsData {
        private String month;
        private int casesWithBases;
        private int casesWithoutBases;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceData {
        private int totalMembers;
        private int availableMembers;
    }

}
