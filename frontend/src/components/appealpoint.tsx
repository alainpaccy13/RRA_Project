"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
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
import { PlusCircle } from "lucide-react";

// Schema for a single appeal point
const appealPointSchema = z.object({
  appealPoint: z.string().min(1, { message: "Appeal point is required." }),
  auditorsOpinion: z.string().min(1, { message: "Auditor's opinion is required" }),
  problemSummary: z.string().min(1, { message: "Problem summary is required." }),
  proposedSolution: z.string().min(1, { message: "Proposed solution is required." }),
});

// Main form schema
const formSchema = z.object({
  caseId: z.string().min(1, { message: "Case ID is required." }),
  appealPoints: z.array(appealPointSchema).min(1, { message: "You must add at least one appeal point." }),
});

export function AppealPointForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {  
      appealPoints: [
        {
          appealPoint: "",
          auditorsOpinion: "",
          problemSummary: "",
          proposedSolution: "",
        },
      ],
    },
  });

  const { fields: appealFields, append: appendAppeal, remove: removeAppeal } = useFieldArray({
    control: form.control,
    name: "appealPoints",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    alert("Form submitted! Check console for values.");
  }

  return (
    <div className="container p-4 max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4 bg-white">
                 <div className="rounded-lg border p-6 space-y-4">
                <h2 className="text-xl font-semibold">Details</h2>
                <h1 className="text-gray-500 font-medium">Appeal point 1</h1>
                {appealFields.map((field, index) => (
                  <div key={field.id} className="space-y-4 border-b pb-4">
                    <FormField control={form.control} name={`appealPoints.${index}.appealPoint`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appeal Point</FormLabel>
                        <FormControl><Input {...field} placeholder="Enter appeal point" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`appealPoints.${index}.problemSummary`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Problem Summary</FormLabel>
                        <FormControl><Textarea {...field} placeholder="problem summary goes here . . . "/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`appealPoints.${index}.auditorsOpinion`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Basis of Tax assessment by Auditor</FormLabel>
                        <FormControl><Textarea {...field} placeholder="auditors comments go here . . ."/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`appealPoints.${index}.proposedSolution`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Solution in accordance with the laws</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Your proposed solution goes here . . . " /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                  </div>
                ))}
                
              </div>
            </div>
            <Button
                    type="button"
                    variant="outline" 
                    className="w-full justify-center text-lg font-bold text-[#18668D] hover:bg-blue-50 hover:text-[#0f567a] border-gray-200 h-10" // Tailor the look
                    onClick={() =>
                        appendAppeal({
                        appealPoint: "",
                        auditorsOpinion: "",
                        problemSummary: "",
                        proposedSolution: "",
                        })
                    }
                    >
                    <PlusCircle className="mr-3 h-6 w-6" /> 
                    Add appeal point
                </Button>
            <div className="flex justify-between">
                <Button type="button"  className="bg-[#18668D]">
                    <a href="/cases/new-case">Back</a>
                </Button>
                <Button type="submit" className="bg-[#18668D]">
                    <a href="/cases/new-case">Done</a>
                </Button>
            </div>
            </>
        </form>
      </Form>
    </div>
  );
}

