// types/case.ts
export interface Case {
  taxOriginal: string;
  amountDischarged: string;
  taxToBePaid: string;
  casePresenter: string;
  auditor: string;
  caseId: string;
  taxPayer: string;
  submittedAt: string;
  daysLeft: number;
  status: "Pending" | "Approved" | "Rejected";
}
