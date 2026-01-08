"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import api from "@/lib/api";

// 1. CORRECTED: Interface to match the backend DTO (casesWithBases, casesWithoutBases)
interface CaseAnalyticsItem {
  month: string;
  casesWithBases: number;
  casesWithoutBases: number;
}

// 2. IMPROVED: Renamed for better clarity
interface ChartDataItem {
  month: string;
  unjustified: number;
  justified: number;
}

export function CaseAnalyticsChart() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/api/v1/my-cases/analytics');
        const analyticsData = response.data?.data;

        if (analyticsData && analyticsData.caseAnalytics) {
          // 3. CORRECTED: Map from the correct backend properties
          const formattedData: ChartDataItem[] = analyticsData.caseAnalytics.map((item: CaseAnalyticsItem) => ({
            month: item.month,
            justified: item.casesWithBases,       // Use casesWithBases
            unjustified: item.casesWithoutBases, // Use casesWithoutBases
          }));
          setChartData(formattedData);
        } else {
          setChartData([]);
        }
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
        setError("Could not load case analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const maxValue = chartData.reduce((max, item) => {
    // 4. IMPROVED: Use clearer variable names here as well
    const currentMax = Math.max(item.justified, item.unjustified);
    return currentMax > max ? currentMax : max;
  }, 0) * 1.25 || 10; // Ensure maxValue is at least 10 to prevent division by zero and give a baseline

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-64 text-gray-500">Loading Chart Data...</div>;
    }

    if (error) {
      return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;
    }
    
    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-64 text-gray-500">No analytics data available.</div>;
    }

    return (
      <div className="relative h-64">
        <div className="absolute inset-0 grid grid-rows-4 w-full h-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border-b border-dashed border-gray-200"></div>
          ))}
        </div>

        <div className="relative flex items-end justify-around h-full px-4">
          {chartData.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
              <div className="flex items-end gap-2 h-full">
                {/* Unjustified bar */}
                <div
                  className="bg-[#ff8181] rounded-t-lg w-5 transition-all hover:opacity-80"
                  style={{ height: `${(data.unjustified / maxValue) * 100}%` }}
                  title={`Unjustified: ${data.unjustified}`}
                ></div>
                {/* Justified bar */}
                <div
                  className="bg-[#84b082] rounded-t-lg w-5 transition-all hover:opacity-80"
                  style={{ height: `${(data.justified / maxValue) * 100}%` }}
                  title={`Justified: ${data.justified}`}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-700">{data.month}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#0a4f78]">Case Analytics</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            {/* 5. IMPROVED: Updated labels for clarity */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff8181]"></div>
              <span className="text-gray-600">WithoutBasis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#84b082]"></div>
              <span className="text-gray-600">WithBasis</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2">
        {renderContent()}
      </CardContent>
    </Card>
  );
}