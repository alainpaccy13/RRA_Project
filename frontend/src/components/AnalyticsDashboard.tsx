"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { CaseAnalyticsChart } from "./case-analytics-chart";
import { AttendanceList } from "./attendance-list";
import AgendaCasesPage from "./cases";
import { useEffect, useState } from "react";
import api from "@/lib/api"; 


interface AnalyticsData {
  totalCases: number;
  reviewRate: number;
  pendingCases: number;
}

export function AnalyticsDashboard() {
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/api/v1/my-cases/analytics');
        if (response.data && response.data.data) {
          setData(response.data.data);
        } else {
          throw new Error("Analytics data not found in the response.");
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Could not load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track Assigned Cases in One Place</p>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Cases Card */}
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total cases
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {/* Display loading state or the fetched data */}
              {loading ? "..." : data?.totalCases ?? 0}
            </div>
          </CardContent>
        </Card>

        {/* Review Rate Card */}
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Review Rate
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
               {/* Display loading state or the fetched data, formatted as a percentage */}
              {loading ? "..." : `${data?.reviewRate ?? 0} %`}
            </div>
          </CardContent>
        </Card>

        {/* Pending Cases Card */}
        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Pending Cases
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {/* Display loading state or the fetched data */}
              {loading ? "..." : data?.pendingCases ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CaseAnalyticsChart />
        </div>
        <div>
          <AttendanceList />
        </div>
      </div>
      <AgendaCasesPage />
    </div>
  );
}