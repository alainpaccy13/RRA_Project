// app/components/SubmissionSuccessModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubmissionSuccessModalProps {
  caseId: string;
  isOpen: boolean;
  onBack: () => void;
}

export function CaseSubmissionSuccess({
  caseId,
  isOpen,
  onBack,
}: SubmissionSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="h-2 w-full flex">
          <div className="h-full w-1/3 bg-[#18668D]"></div>
          <div className="h-full w-1/3 bg-[#FDBB2A]"></div>
          <div className="h-full w-1/3 bg-[#4BAF4F]"></div>
        </div>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tax Case Form</DialogTitle>
          <DialogDescription className="text-lg text-gray-700 mt-2">
            Your explanatory note for case **{caseId}** has been successfully submitted! You&apos;ve been notified for any updates.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Button onClick={onBack} className="bg-[#18668D]">
            Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}