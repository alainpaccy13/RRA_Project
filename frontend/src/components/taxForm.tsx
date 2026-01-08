"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "./ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import api from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Schema for a single appeal point
const appealPointSchema = z.object({
  appealPoint: z.string().min(1, { message: "Appeal point is required." }),
  auditorsOpinion: z.string().min(1, { message: "Auditor's opinion is required." }),
  summarisedProblem: z.string().min(1, { message: "Problem summary is required." }),
  proposedSolution: z.string().min(1, { message: "Proposed solution is required." }),
});

// Schema for a single tax item now includes its own appeals array
const taxItemSchema = z.object({
  auditedTaxType: z.string().min(1, { message: "Tax type is required." }),
  principalAmount: z.number().min(0, { message: "Must be a positive number." }),
  understatementFines: z.number().min(0, { message: "Must be a positive number." }),
  fixedAdministrativeFines: z.number().min(0, { message: "Must be a positive number." }),
  dischargedAmount: z.number().min(0, { message: "Must be a positive number." }),
  otherFines: z.number().min(0, { message: "Must be a positive number." }),
  appeals: z.array(appealPointSchema).min(1, { message: "At least one appeal point is required for this tax type." }),
});

// Main form schema updated to remove the top-level appealPoints
const formSchema = z.object({
  taxPayerTIN: z.string().min(1, { message: "TIN is required." }),
  taxAssessmentTime: z.string().min(1, { message: "Assessment time is required." }),
  dateAssessmentReceived: z.string().min(1, { message: "Date is required." }),
  appealDate: z.string().optional().or(z.literal("")),
  appealExpireDate: z.string().optional().or(z.literal("")),
  caseId: z.string().min(1, { message: "Case ID is required." }),
  auditorNames: z.string().min(1, { message: "Auditor name is required." }),
  taxItems: z.array(taxItemSchema).min(1, { message: "You must add at least one tax item." }),
});


// MAIN TAXFORM COMPONENT DEFINITION AND HOOKS
export function TaxForm({ caseIdToEdit }: { caseIdToEdit: string | null }) {
  const router = useRouter();
  const isEditMode = !!caseIdToEdit;
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taxPayerTIN: "",
      caseId: "",
      auditorNames: "",
      dateAssessmentReceived: "",
      appealDate: "",
      appealExpireDate: "",
      taxItems: [
        {
          auditedTaxType: "",
          principalAmount: 0,
          understatementFines: 0,
          fixedAdministrativeFines: 0,
          dischargedAmount: 0,
          otherFines: 0,
          appeals: [
            {
              appealPoint: "",
              summarisedProblem: "",
              auditorsOpinion: "",
              proposedSolution: "",
            },
          ],
        },
      ],
    },
  });

useEffect(() => {
    // A helper function to format dates from ISO string (2023-12-25T00:00:00.000Z)
    // to what an <input type="date"> needs (2023-12-25)
    const formatDateForInput = (isoDate: string | null | undefined) => {
      if (!isoDate) return "";
      return isoDate.split('T')[0];
    };

    const fetchAndSetCaseData = async () => {
      if (!caseIdToEdit) return;

      try {
        const response = await api.get(`/api/v1/auth/explanatory_note/${caseIdToEdit}`);
        const data = response.data.data;

        // Map the fetched data to match the form's schema
        const formData = {
          caseId: data.caseId,
          auditorNames: data.auditorsName, // Note the name difference
          taxPayerTIN: data.tin,
          taxAssessmentTime: data.taxAssessmentTime,
          dateAssessmentReceived: formatDateForInput(data.taxAssessmentAcknowledgementDateByTaxpayer),
          appealDate: formatDateForInput(data.appealDate),
          appealExpireDate: formatDateForInput(data.appealExpireDate),
          taxItems: data.taxAudited.map((item: any) => ({
            auditedTaxType: item.taxTypeAudited,
            principalAmount: item.principalAmountToBePaid,
            understatementFines: item.understatementFines,
            fixedAdministrativeFines: item.fixedAdministrativeFines,
            dischargedAmount: item.dischargedAmount,
            otherFines: item.otherFines,
            appeals: item.appeals.map((appeal: any) => ({
              appealPoint: appeal.appealPoint,
              summarisedProblem: appeal.summarisedProblem,
              auditorsOpinion: appeal.auditorsOpinion,
              proposedSolution: appeal.proposedSolution,
            })),
          })),
        };

        form.reset(formData); 
      } catch (error) {
        console.error("Failed to fetch case data for editing:", error);
        alert("Failed to load case data. Please try again.");
      } finally {
        setIsLoadingData(false); 
      }
    };

    fetchAndSetCaseData();
  }, [caseIdToEdit, form]);

  const { fields: taxFields, append: appendTax, remove: removeTax } = useFieldArray({
    control: form.control,
    name: "taxItems",
  });

  const [total, setTotal] = useState(0);
  const [files, setFiles] = useState<File[] | undefined>();
  const [userName, setUserName] = useState("Unknown");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("staff_name");
    if (name) setUserName(name);
  }, []);

  // Function to save note without changing status
  async function saveNoteWithoutStatusChange(values: z.infer<typeof formSchema>) {
    if (!caseIdToEdit) {
      alert("Cannot save without a case ID");
      return;
    }

    setIsSubmitting(true);
    let uploadedFileUrl = "";

    if (files && files.length > 0) {
      const file = files[0];
      const storageRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        uploadedFileUrl = await getDownloadURL(snapshot.ref);
      } catch (err) {
        console.error("Firebase upload error:", err);
        alert("Error uploading attachment. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    const toISOString = (dateString: string | undefined | null): string | null => {
      if (!dateString) return null;
      try {
        return new Date(dateString).toISOString();
      } catch (e) {
        console.error("Could not parse date:", dateString);
        return null;
      }
    };

    try {
      const payload = {
        caseId: values.caseId,
        auditorsName: values.auditorNames,
        taxAssessmentAcknowledgementDateByTaxpayer: toISOString(values.dateAssessmentReceived),
        taxAssessmentTime: values.taxAssessmentTime,
        appealDate: toISOString(values.appealDate),
        appealExpireDate: toISOString(values.appealExpireDate),
        casePresenter: userName,
        tin: values.taxPayerTIN,
        attachmentLink: uploadedFileUrl || "",
        taxAudited: values.taxItems.map(taxItem => ({
          taxTypeAudited: taxItem.auditedTaxType,
          principalAmountToBePaid: taxItem.principalAmount,
          understatementFines: taxItem.understatementFines,
          fixedAdministrativeFines: taxItem.fixedAdministrativeFines,
          dischargedAmount: taxItem.dischargedAmount,
          otherFines: taxItem.otherFines,
          totalTaxAndFinesToBePaid:
            (taxItem.principalAmount || 0) +
            (taxItem.understatementFines || 0) +
            (taxItem.fixedAdministrativeFines || 0) -
            (taxItem.dischargedAmount || 0),
          appeals: taxItem.appeals.map(ap => ({
            appealPoint: ap.appealPoint,
            summarisedProblem: ap.summarisedProblem,
            auditorsOpinion: ap.auditorsOpinion,
            proposedSolution: ap.proposedSolution
          }))
        }))
      };

      const url = `${API_URL}/api/v1/auth/explanatory_note/${caseIdToEdit}/save`;

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("staff_token")}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Failed to save note: ${errorBody}`);
      }

      alert("Note saved successfully!");

    } catch (err) {
      console.error(err);
      alert(`Error saving note. See console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Function to save and move to pre-appeal
  async function saveAndMoveToPreAppeal(values: z.infer<typeof formSchema>) {
    if (!caseIdToEdit) {
      alert("Cannot save without a case ID");
      return;
    }

    setIsSubmitting(true);

    try {
      // First save the note
      await saveNoteWithoutStatusChange(values);

      // Then move to pre-appeal
      const url = `${API_URL}/api/v1/auth/explanatory_note/${caseIdToEdit}/move-to-pre-appeal`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("staff_token")}`
        }
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Failed to move to pre-appeal: ${errorBody}`);
      }

      alert("Note moved to pre-appeal successfully!");
      router.push('/pre-appeal');

    } catch (err) {
      console.error(err);
      alert(`Error moving to pre-appeal. See console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const taxTypes = [
    { value: "VAT", label: "VAT" },
    { value: "CIT", label: "Corporate Income Tax" },
    { value: "PAYE", label: "PAYE" },
  ];

  const calculateTotal = () => {
    const values = form.getValues().taxItems;
    const newTotal = values.reduce((sum, item) => {
      return sum + (item.principalAmount || 0) + (item.understatementFines || 0) + (item.fixedAdministrativeFines || 0);
    }, 0);
    setTotal(newTotal);
  };

  useEffect(() => {
    const subscription = form.watch(calculateTotal);
    return () => subscription.unsubscribe();
  }, [form]);

  const handleDrop = (files: File[]) => {
    setFiles(files);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    let uploadedFileUrl = "";

    if (files && files.length > 0) {
      const file = files[0];
      const storageRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        uploadedFileUrl = await getDownloadURL(snapshot.ref);
      } catch (err) {
        console.error("Firebase upload error:", err);
        alert("Error uploading attachment. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    const toISOString = (dateString: string | undefined | null): string | null => {
        if (!dateString) return null;
        try {
            return new Date(dateString).toISOString();
        } catch (e) {
            console.error("Could not parse date:", dateString);
            return null;
        }
    };

    try {
      const payload = {
        caseId: values.caseId,
        auditorsName: values.auditorNames,
        taxAssessmentAcknowledgementDateByTaxpayer: toISOString(values.dateAssessmentReceived),
        taxAssessmentTime: values.taxAssessmentTime,
        appealDate: toISOString(values.appealDate),
        appealExpireDate: toISOString(values.appealExpireDate),
        casePresenter: userName,
        tin: values.taxPayerTIN,
        attachmentLink: uploadedFileUrl,
        taxAudited: values.taxItems.map(taxItem => ({
          taxTypeAudited: taxItem.auditedTaxType,
          principalAmountToBePaid: taxItem.principalAmount,
          understatementFines: taxItem.understatementFines,
          fixedAdministrativeFines: taxItem.fixedAdministrativeFines,
          dischargedAmount: taxItem.dischargedAmount,
          otherFines: taxItem.otherFines,
          totalTaxAndFinesToBePaid:
            (taxItem.principalAmount || 0) +
            (taxItem.understatementFines || 0) +
            (taxItem.fixedAdministrativeFines || 0) -
            (taxItem.dischargedAmount || 0),
          appeals: taxItem.appeals.map(ap => ({
            appealPoint: ap.appealPoint,
            summarisedProblem: ap.summarisedProblem,
            auditorsOpinion: ap.auditorsOpinion,
            proposedSolution: ap.proposedSolution
          }))
        }))
      };

      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode
        ? `${API_URL}/api/v1/auth/explanatory_note/${caseIdToEdit}`
        : `${API_URL}/api/v1/auth/explanatory_note/`;

      const res = await fetch(url, {
        method, // Use the determined method
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("staff_token")}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Failed to ${isEditMode ? 'update' : 'submit'} case: ${errorBody}`);
      }

      alert(`Case ${isEditMode ? 'updated' : 'submitted'} successfully!`);
      router.push('/cases/all-cases');

    } catch (err) {
      console.error(err);
      alert(`Error ${isEditMode ? 'updating' : 'submitting'} case. See console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingData) {
    return <div className="text-center p-8">Loading case data...</div>;
  }
return (
    <div className="container p-4 max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Case Info & Dates (No longer in a separate step) */}
          <div className="rounded-lg border p-6 space-y-4 bg-white shadow-md">
            <h2 className="text-xl font-semibold">Case Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="caseId" render={({ field }) => (<FormItem><FormLabel>Case ID</FormLabel><FormControl><Input placeholder="e.g., TAX-2023-001" {...field} disabled={isEditMode} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="auditorNames" render={({ field }) => (<FormItem><FormLabel>Auditor Names</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="taxPayerTIN" render={({ field }) => (<FormItem><FormLabel>Tax Payer TIN</FormLabel><FormControl><Input placeholder="NNN-NN-NNNNN" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="taxAssessmentTime" render={({ field }) => (<FormItem><FormLabel>Tax Assessment Period</FormLabel><FormControl><Input placeholder="Input here" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="dateAssessmentReceived" render={({ field }) => (<FormItem><FormLabel>Date Tax Assessment Received</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="appealDate" render={({ field }) => (<FormItem><FormLabel>Appeal Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="appealExpireDate" render={({ field }) => (<FormItem><FormLabel>Appeal Expire Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          </div>

          {/* Dynamic Tax Items Section */}
          {taxFields.map((taxField, taxIndex) => (
            <div key={taxField.id} className="rounded-lg border p-6 space-y-6 bg-white shadow-md">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Tax Info #{taxIndex + 1}</h2>
                     {taxFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTax(taxIndex)}>
                            <Trash2 className="h-5 w-5 text-red-500" />
                        </Button>
                    )}
                </div>

              {/* Fields for the Tax Item itself */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={`taxItems.${taxIndex}.auditedTaxType`} render={({ field }) => (
                    <FormItem className="col-span-full"><FormLabel>Audited Tax Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Tax Type" /></SelectTrigger></FormControl><SelectContent>{taxTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name={`taxItems.${taxIndex}.principalAmount`} render={({ field }) => (<FormItem><FormLabel>Principal Amount</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`taxItems.${taxIndex}.understatementFines`} render={({ field }) => (<FormItem><FormLabel>Understatement Fines</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`taxItems.${taxIndex}.fixedAdministrativeFines`} render={({ field }) => (<FormItem><FormLabel>Fixed Admin Fines</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`taxItems.${taxIndex}.dischargedAmount`} render={({ field }) => (<FormItem><FormLabel>Discharged Amount</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`taxItems.${taxIndex}.otherFines`} render={({ field }) => (<FormItem><FormLabel>Other Fines</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              </div>

              {/* Calling the new helper component to render the nested appeals */}
              <NestedAppealArray taxIndex={taxIndex} />
            </div>
          ))}

          {/* This button now appends a full taxItem object, including a default nested appeal */}
          <Button type="button" variant="outline" className="w-full" onClick={() => appendTax({
              auditedTaxType: "",
              principalAmount: 0,
              understatementFines: 0,
              fixedAdministrativeFines: 0,
              dischargedAmount: 0,
              otherFines: 0,
              appeals: [{ appealPoint: "", summarisedProblem: "", auditorsOpinion: "", proposedSolution: "" }]
          })}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Another Tax Type
          </Button>

          <Dropzone accept={{'application/pdf': [], 'image/*': []}} maxSize={1024 * 1024 * 10} onDrop={handleDrop} src={files} className="border-[#18668D] border-2 border-dashed text-[#18668D]">
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>

          <div className="rounded-lg border p-6 bg-white font-bold text-lg">
            Total taxes and fines to be paid: {total.toLocaleString()} RWF
          </div>

          <div className="flex justify-end space-x-4">
            {isEditMode && (
              <>
                <Button 
                  type="button" 
                  className="bg-gray-500 hover:bg-gray-600" 
                  disabled={isSubmitting}
                  onClick={async () => {
                    const formValues = form.getValues();
                    await saveNoteWithoutStatusChange(formValues);
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  type="button" 
                  className="bg-purple-600 hover:bg-purple-700" 
                  disabled={isSubmitting}
                  onClick={async () => {
                    const formValues = form.getValues();
                    await saveAndMoveToPreAppeal(formValues);
                  }}
                >
                  {isSubmitting ? 'Processing...' : 'Ready for Pre Appeal'}
                </Button>
              </>
            )}
            <Button type="submit" className="bg-[#18668D]" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Case' : 'Submit Case')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function NestedAppealArray({ taxIndex }: { taxIndex: number }) {
    const { control } = useFormContext(); 
    const { fields, append, remove } = useFieldArray({
        control,
        name: `taxItems.${taxIndex}.appeals`
    });

    return (
        <div className="space-y-4 pt-4 border-t">
             <h3 className="text-lg font-semibold">Appeal Points</h3>
            {fields.map((field, appealIndex) => (
                <div key={field.id} className="p-4 border rounded-md space-y-2 relative bg-gray-50">
                    {/* Button to remove a specific appeal point */}
                    {fields.length > 1 && (
                         <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(appealIndex)}>
                            <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                    )}

                    {/* Form fields for the appeal point, with correctly nested names */}
                    <FormField control={control} name={`taxItems.${taxIndex}.appeals.${appealIndex}.appealPoint`} render={({ field }) => (<FormItem><FormLabel>Appeal Point #{appealIndex + 1}</FormLabel><FormControl><Input {...field} placeholder="Enter appeal point" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`taxItems.${taxIndex}.appeals.${appealIndex}.summarisedProblem`} render={({ field }) => (<FormItem><FormLabel>Problem Summary</FormLabel><FormControl><Textarea {...field} placeholder="Problem summary..." /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`taxItems.${taxIndex}.appeals.${appealIndex}.auditorsOpinion`} render={({ field }) => (<FormItem><FormLabel>Basis of Tax assessment by Auditor</FormLabel><FormControl><Textarea {...field} placeholder="Auditor's comments..." /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`taxItems.${taxIndex}.appeals.${appealIndex}.proposedSolution`} render={({ field }) => (<FormItem><FormLabel>Proposed Solution</FormLabel><FormControl><Textarea {...field} placeholder="Proposed solution..." /></FormControl><FormMessage /></FormItem>)} />
                </div>
            ))}
             <Button type="button" variant="secondary" className="w-full" onClick={() => append({ appealPoint: "", summarisedProblem: "", auditorsOpinion: "", proposedSolution: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Appeal Point to this Tax Type
            </Button>
        </div>
    );
}
