// @/components/analytics/stat-card.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative";
  isLoading?: boolean;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none h-28">
      <CardContent>
        <div className="flex items-center justify-between space-y-0 pb-2">
          <div className="text-sm font-medium ">{title}</div>
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <div
              className={`flex items-center text-xs ${
                changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              {changeType === "positive" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {change}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
