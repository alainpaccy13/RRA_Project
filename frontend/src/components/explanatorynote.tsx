"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import jsPDF from "jspdf";
import { Loader2, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Types ---
interface CaseSummary {
  caseId: string;
  taxPayerName?: string; // Optional depending on your API
}

interface AppealPoint {
  AppealId: string;
  appealPoint: string;
  auditorsOpinion: string;
  proposedSolution: string;
}

interface TaxAudited {
  taxTypeAudited: string;
  appeals: AppealPoint[];
}

// --- Schema ---
const formSchema = z.object({
  caseId: z.string().min(1, "Please select a Case ID"),
  appealPointId: z.string().min(1, "Please select an Appeal Point"),
  additionalComments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ExplanatoryNoteGenerator() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [availableAppeals, setAvailableAppeals] = useState<AppealPoint[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // We store the full selected objects to use in the PDF later
  const [selectedCaseData, setSelectedCaseData] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseId: "",
      appealPointId: "",
      additionalComments: "",
    },
  });

  // 1. Fetch All Cases for the dropdown
  useEffect(() => {
    const fetchCases = async () => {
      setIsLoadingCases(true);
      try {
        // NOTE: Using the endpoint you requested. 
        // If this doesn't exist in backend, swap with '/api/v1/my-cases/my-cases' or '/api/v1/agenda/'
        const response = await api.get("/api/v1/all-cases"); 
        
        // Handling different possible response structures based on your previous code
        const data = response.data.data || response.data.content || response.data;
        
        if (Array.isArray(data)) {
          setCases(data);
        }
      } catch (error) {
        console.error("Failed to fetch cases:", error);
      } finally {
        setIsLoadingCases(false);
      }
    };
    fetchCases();
  }, []);

  // 2. Fetch Appeal Points when Case ID changes
  const handleCaseIdChange = async (caseId: string) => {
    form.setValue("caseId", caseId);
    form.setValue("appealPointId", ""); // Reset appeal point
    setAvailableAppeals([]); // Clear previous appeals
    
    if (!caseId) return;

    setIsLoadingDetails(true);
    try {
      const response = await api.get(`/api/v1/auth/explanatory_note/${caseId}`);
      
      if (response.data && response.data.data) {
        const caseData = response.data.data;
        setSelectedCaseData(caseData);

        // Flatten appeals from all tax types
        const allAppeals: AppealPoint[] = [];
        if (caseData.taxAudited && Array.isArray(caseData.taxAudited)) {
          caseData.taxAudited.forEach((taxItem: TaxAudited) => {
            if (taxItem.appeals) {
              allAppeals.push(...taxItem.appeals);
            }
          });
        }
        setAvailableAppeals(allAppeals);
      }
    } catch (error) {
      console.error("Failed to fetch case details:", error);
      alert("Could not fetch appeal points for this case.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // 3. PDF Generation Logic
  const generatePDF = (values: FormValues) => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = 20;

    // Find the specific appeal object for details
    const selectedAppeal = availableAppeals.find(a => a.AppealId === values.appealPointId);

    // Header
    doc.setFontSize(18);
    doc.setTextColor(24, 102, 141); // RRA Blue color
    doc.text("Explanatory Note Report", margin, yPos);
    yPos += 15;

    // Case Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Case ID: ${values.caseId}`, margin, yPos);
    yPos += 10;
    
    if (selectedCaseData) {
        doc.setFont("helvetica", "normal");
        doc.text(`Taxpayer TIN: ${selectedCaseData.tin || 'N/A'}`, margin, yPos);
        yPos += 10;
        doc.text(`Auditor: ${selectedCaseData.auditorsName || 'N/A'}`, margin, yPos);
        yPos += 15;
    }

    // Line Separator
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, 190, yPos);
    yPos += 10;

    // Appeal Point Details
    if (selectedAppeal) {
        doc.setFont("helvetica", "bold");
        doc.text("Selected Appeal Point:", margin, yPos);
        yPos += 7;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        // splitTextToSize handles wrapping text so it doesn't go off page
        const splitTitle = doc.splitTextToSize(selectedAppeal.appealPoint, 170);
        doc.text(splitTitle, margin, yPos);
        yPos += (splitTitle.length * 6) + 5;

        doc.setFont("helvetica", "bold");
        doc.text("Auditor's Opinion:", margin, yPos);
        yPos += 7;

        doc.setFont("helvetica", "normal");
        const splitOpinion = doc.splitTextToSize(selectedAppeal.auditorsOpinion || "N/A", 170);
        doc.text(splitOpinion, margin, yPos);
        yPos += (splitOpinion.length * 6) + 5;
    }

    // Additional Comments
    if (values.additionalComments) {
        yPos += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Additional Comments:", margin, yPos);
        yPos += 7;
        doc.setFont("helvetica", "normal");
        const splitComments = doc.splitTextToSize(values.additionalComments, 170);
        doc.text(splitComments, margin, yPos);
    }

    // Footer / Date
    const dateStr = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generated on: ${dateStr}`, margin, 280);

    // Save
    doc.save(`Explanatory_Note_${values.caseId}.pdf`);
  };

  const onSubmit = (values: FormValues) => {
    generatePDF(values);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 shadow-lg">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-xl text-[#18668D]">Generate Explanatory Note PDF</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Case ID Selection */}
            <FormField
              control={form.control}
              name="caseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Case ID</FormLabel>
                  <Select 
                    onValueChange={(val) => handleCaseIdChange(val)} 
                    value={field.value}
                    disabled={isLoadingCases}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingCases ? "Loading cases..." : "Select a case identifier"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cases.map((c) => (
                        <SelectItem key={c.caseId} value={c.caseId}>
                          {c.caseId} {c.taxPayerName ? `- ${c.taxPayerName}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Appeal Point Selection (Dependent on Case ID) */}
            <FormField
              control={form.control}
              name="appealPointId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Appeal Point</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!form.getValues("caseId") || isLoadingDetails}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !form.getValues("caseId") 
                            ? "Select a case first" 
                            : isLoadingDetails 
                              ? "Loading appeal points..." 
                              : "Select an appeal point"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAppeals.length === 0 && !isLoadingDetails ? (
                        <SelectItem value="none" disabled>No appeal points found</SelectItem>
                      ) : (
                        availableAppeals.map((appeal) => (
                          <SelectItem key={appeal.AppealId} value={appeal.AppealId}>
                            {appeal.appealPoint.substring(0, 60)}{appeal.appealPoint.length > 60 ? "..." : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Comments */}
            <FormField
              control={form.control}
              name="additionalComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any extra notes to appear in the PDF..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-[#18668D] hover:bg-[#134d66]"
              disabled={!form.formState.isValid}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Generate PDF
            </Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}