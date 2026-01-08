"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Zod schema for form validation (keeps user-friendly HH:mm format)
const formSchema = z.object({
  venue: z.string().min(3, {
    message: "Venue must be at least 3 characters long.",
  }),
  meetingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in HH:mm format (e.g., 14:30).",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface InvitationTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvitationTemplateModal({ isOpen, onClose }: InvitationTemplateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      venue: "",
      meetingTime: "",
    },
  });

  // Function to handle form submission
  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);

    // --- THIS IS THE MODIFIED PART ---
    // Construct the payload to match the backend's "HH:mm:ss" format
    const payload = {
      venue: values.venue,
      meetingTime: `${values.meetingTime}:00`, // Append seconds to the time string
    };
    // --- END OF MODIFICATION ---

    try {
      await api.put('/api/v1/meeting-info/3', payload); 
      
      alert("Invitation details updated successfully!");
      onClose(); // Close the modal on success
    } catch (err) {
      console.error("Failed to update invitation details:", err);
      setError("Failed to update details. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invitation Date-Venue</DialogTitle>
          <DialogDescription>
            Update the default venue and time for meeting invitations.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold mb-4">Email information</h3>
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., RRA Headquarters, Room 501" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="meetingTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Meeting Hour</FormLabel>
                        <FormControl>
                            <Input placeholder="HH:mm (e.g., 14:30)" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

             {error && <p className="text-sm text-red-600">{error}</p>}

            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-[#18668D] hover:bg-[#134d66]"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}