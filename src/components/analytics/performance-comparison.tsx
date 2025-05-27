// @/components/analytics/performance-comparison-chart.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PerformanceData {
  date: string;
  sent: number;
  opened: number;
  responded: number;
}

interface PerformanceComparisonChartProps {
  data: PerformanceData[];
  isLoading?: boolean;
}

export function PerformanceComparisonChart({
  data,
  isLoading = false,
}: PerformanceComparisonChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Monthly Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  const formattedData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Monthly Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#666"
              fontSize={12}
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#666" fontSize={12} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Bar
              dataKey="sent"
              fill="#22c55e"
              name="Emails Sent"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="opened"
              fill="#3b82f6"
              name="Emails Opened"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="responded"
              fill="#f59e0b"
              name="Responses"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
