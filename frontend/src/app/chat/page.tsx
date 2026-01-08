"use client";
import Sidebar from "@/components/sidebar";
import AuthGuard from "@/components/authguard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { MdVideoCall } from "react-icons/md";
import { useState } from "react";
import api from "@/lib/api";

import { useEffect } from "react";

export default function ChatPage() {
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewMeeting = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/meetings/create');
      if (response.data && response.data.meetLink) {
        const link = response.data.meetLink;
        setMeetingUrl(link);
        window.open(link, '_blank');
        // Clear pending flag on success
        localStorage.removeItem("pendingMeeting");
      } else {
        throw new Error("Did not receive a meeting link from the server.");
      }
    } catch (err: any) {
      console.error("Failed to create meeting:", err);
      if (err.response && err.response.status === 401) {
        // Remember we wanted to create a meeting
        localStorage.setItem("pendingMeeting", "true");
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
      } else {
        setError("Failed to create a new meeting. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-create meeting after Google login redirect
  useEffect(() => {
    const pending = localStorage.getItem("pendingMeeting");
    if (pending === "true" && !meetingUrl && !isLoading) {
      handleNewMeeting();
    }
  }, []);

  return (
    <AuthGuard>
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1">
        <Sidebar/>
        <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-lg p-8 shadow-xl rounded-2xl">
        <CardContent className="flex flex-col items-center text-center p-0">
          <h1 className="text-3xl font-bold text-gray-800">Video Calls and meetings</h1>
          <p className="mt-2 text-gray-500">Connect, Share and Collaborate</p>
          
          <div className="flex items-center w-full max-w-md mt-8 space-x-2">
            <Button variant="outline" size="icon" className="h-10 w-10 text-[#0a608b]"><MdVideoCall size={32} /></Button>
            <Input type="text" placeholder="Enter a link to join" className="h-10" />
            <Button className="h-10 bg-[#0a608b] hover:bg-[#084a6e]">Join</Button>
          </div>

          <div className="flex items-center w-full max-w-md my-6"><div className="flex-grow border-t border-gray-200"></div><span className="mx-4 text-xs text-gray-400">OR</span><div className="flex-grow border-t border-gray-200"></div></div>
          
          <Button onClick={handleNewMeeting} disabled={isLoading} className="h-10 bg-[#0a608b] hover:bg-[#084a6e] px-6">
            <Video className="mr-2 h-4 w-4" />
            {isLoading ? "Creating..." : "New meeting"}
          </Button>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
      </main>
    
    </div>
    </AuthGuard>
  );
}
