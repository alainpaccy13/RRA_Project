"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useEffect, useState } from "react"; // Import hooks for state and effects
import api from "@/lib/api"; // Import your configured API instance

// 1. Define an interface for the attendance data structure
interface AttendanceData {
  totalMembers: number;
  availableMembers: number;
}

export function AttendanceList() {
  // 2. Set up state for data, loading, and errors
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 3. Fetch data when the component mounts
    const fetchAttendanceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/api/v1/my-cases/analytics');
        const analyticsData = response.data?.data;

        if (analyticsData && analyticsData.attendanceList) {
          setAttendanceData(analyticsData.attendanceList);
        } else {
          throw new Error("Attendance data is missing in the API response.");
        }
      } catch (err) {
        console.error("Failed to fetch attendance data:", err);
        setError("Could not load attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // 4. Helper function to render content based on the current state
  const renderContent = () => {
    if (loading) {
      return <p className="text-sm font-medium">Loading attendance...</p>;
    }

    if (error) {
      return <p className="text-sm font-medium text-red-500">{error}</p>;
    }

    if (attendanceData) {
      return (
        <p className="text-sm font-medium">
          {attendanceData.availableMembers} / {attendanceData.totalMembers} members will be available
        </p>
      );
    }

    return <p className="text-sm font-medium">No attendance data found.</p>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Attendance List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-32">
          <div className="text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            {renderContent()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}