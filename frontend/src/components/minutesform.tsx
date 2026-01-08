"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import jsPDF from "jspdf";
import { Trash2, PlusCircle, FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 1. Schema for a SINGLE minute entry
const minuteEntrySchema = z.object({
  caseId: z.string().min(1, { message: "Case ID is required." }),
  taxPayerName: z.string().min(1, { message: "Tax Payer Name is required." }),
  caseIssue: z.string().min(1, { message: "Case issue is required." }),
  resolution: z.string().min(1, { message: "Resolution is required." }),
});

// 2. Main form schema containing an ARRAY of minutes
const formSchema = z.object({
  minutesList: z.array(minuteEntrySchema).min(1, { message: "At least one minute entry is required." }),
});

type FormValues = z.infer<typeof formSchema>;

export function MinutesForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minutesList: [
        {
          caseId: "",
          taxPayerName: "",
          caseIssue: "",
          resolution: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "minutesList",
  });

  // Helper function to load image from public folder and convert to Base64
  const getImageData = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = "Anonymous"; 
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } else {
          reject(new Error("Canvas context is null"));
        }
      };
      img.onerror = (error) => reject(error);
    });
  };

  async function onSubmit(values: FormValues) {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 15;
      const lineHeight = 6;
      
      // --- 1. ADD LOGO ---
      try {
        // Ensure /Rralogo.png exists in your public folder
        const logoData = await getImageData("/Rralogo.png");
        // Add image (x, y, width, height)
        doc.addImage(logoData, "PNG", margin, yPos, 25, 25); 
      } catch (err) {
        console.error("Could not load logo:", err);
        // Fallback text if logo fails
        doc.setFontSize(10);
        doc.text("[RRA LOGO]", margin, yPos + 10);
      }

      // --- 2. HEADER TEXT ---
      // RRA Blue Color for Header
      doc.setTextColor(24, 102, 141); 
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Rwanda Revenue Authority", 50, yPos + 10);
      
      doc.setFontSize(16);
      doc.setTextColor(100); // Gray
      doc.text("Meeting Minutes Report", 50, yPos + 18);

      doc.setLineWidth(0.5);
      doc.setDrawColor(200);
      doc.line(margin, yPos + 30, pageWidth - margin, yPos + 30);

      yPos += 45; // Move down below header

      // --- 3. CONTENT LOOP ---
      doc.setTextColor(0); // Black text
      doc.setFontSize(11);

      values.minutesList.forEach((item, index) => {
        // Check for page break
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // --- Item Header Box ---
        doc.setFillColor(24, 102, 141); // RRA Blue background
        doc.rect(margin, yPos, pageWidth - (margin * 2), 8, "F");
        
        doc.setTextColor(255, 255, 255); // White text
        doc.setFont("helvetica", "bold");
        doc.text(`Minute Entry #${index + 1}`, margin + 3, yPos + 5.5);
        
        yPos += 14;

        // --- Case Details ---
        doc.setTextColor(0); // Reset to black
        
        // Row 1: Case ID and Taxpayer
        doc.setFont("helvetica", "bold");
        doc.text("Case ID:", margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(item.caseId, margin + 25, yPos);

        doc.setFont("helvetica", "bold");
        doc.text("Tax Payer:", margin + 80, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(item.taxPayerName, margin + 105, yPos);

        yPos += 10;

        // Row 2: Issue (Wrapped Text)
        doc.setFont("helvetica", "bold");
        doc.text("Case Issue / Appeal Point:", margin, yPos);
        yPos += 6;
        
        doc.setFont("helvetica", "normal");
        const splitIssue = doc.splitTextToSize(item.caseIssue, pageWidth - (margin * 2));
        doc.text(splitIssue, margin, yPos);
        yPos += (splitIssue.length * lineHeight) + 4;

        // Row 3: Resolution (Wrapped Text)
        // Highlight resolution slightly
        doc.setFillColor(245, 245, 245); // Very light gray bg for resolution
        const resolutionHeight = (doc.splitTextToSize(item.resolution, pageWidth - (margin * 2)).length * lineHeight) + 10;
        
        // Check page break before drawing resolution box
        if (yPos + resolutionHeight > 270) {
            doc.addPage();
            yPos = 20;
        }

        doc.rect(margin, yPos - 4, pageWidth - (margin * 2), resolutionHeight, "F");
        
        doc.setFont("helvetica", "bold");
        doc.text("Committee Resolution:", margin + 2, yPos + 2);
        yPos += 8;

        doc.setFont("helvetica", "normal");
        const splitResolution = doc.splitTextToSize(item.resolution, pageWidth - (margin * 2) - 5);
        doc.text(splitResolution, margin + 2, yPos);
        
        yPos += (splitResolution.length * lineHeight) + 15; // Spacing for next item
      });

      // --- 4. FOOTER ---
      const dateStr = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const pageCount = doc.getNumberOfPages();
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.line(margin, 280, pageWidth - margin, 280); // Footer line
        doc.text(`Generated on: ${dateStr}`, margin, 288);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 288);
      }

      // Save
      doc.save(`Meeting_Minutes_${new Date().toISOString().slice(0,10)}.pdf`);

    } catch (error) {
      console.error("PDF Generation Error", error);
      alert("Failed to generate PDF. Please check the console.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="container p-4 max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {fields.map((field, index) => (
            <Card key={field.id} className="relative border-l-4 border-l-[#18668D] shadow-md bg-white">
              <CardHeader className="pb-2 bg-gray-50/50 border-b mb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold text-[#18668D]">
                    Minute Entry #{index + 1}
                  </CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`minutesList.${index}.caseId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. C-12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`minutesList.${index}.taxPayerName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Payer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`minutesList.${index}.caseIssue`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Issue / Appeal Point</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the issue discussed..." 
                          className="resize-none min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`minutesList.${index}.resolution`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#18668D] font-bold">Committee Resolution</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the final decision taken..." 
                          className="min-h-[100px] bg-blue-50/30 border-blue-200 focus-visible:ring-blue-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4 sticky bottom-4 bg-transparent">
            <Button
              type="button"
              variant="outline"
              className="border-dashed border-2 border-gray-400 hover:border-[#18668D] hover:text-[#18668D] bg-white/80 backdrop-blur-sm"
              onClick={() => append({ caseId: "", taxPayerName: "", caseIssue: "", resolution: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Minutes
            </Button>

            <Button 
              type="submit" 
              className="bg-[#18668D] hover:bg-[#134d66] w-full sm:w-auto shadow-lg"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" /> Generate PDF
                </>
              )}
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}