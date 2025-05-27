// @/components/analytics/email-trends-chart.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EmailTrendsData {
  date: string;
  sent: number;
  opened: number;
  responded: number;
}

interface EmailTrendsChartProps {
  data: EmailTrendsData[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  isLoading?: boolean;
}

export function EmailTrendsChart({
  data,
  selectedMetric,
  onMetricChange,
  isLoading = false,
}: EmailTrendsChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Email Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "sent":
        return "#22c55e";
      case "opened":
        return "#3b82f6";
      case "responded":
        return "#f59e0b";
      default:
        return "#22c55e";
    }
  };

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
        <CardTitle className="flex items-center justify-between">
          <span>Email Performance Trends</span>
          <Select value={selectedMetric} onValueChange={onMetricChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData}>
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
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value, name) => [value, name]}
            />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricColor(selectedMetric)}
              strokeWidth={2}
              fill={getMetricColor(selectedMetric)}
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
