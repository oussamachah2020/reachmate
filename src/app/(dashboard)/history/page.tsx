"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmailHistoryData } from "@/hooks/use-history";
import { QuickStats } from "@/components/history/quick-stat";
import { EmailHistoryList } from "@/components/history/emails-list";
import { RecipientsInsights } from "@/components/history/recepient-insigth";
import { TemplatePerformance } from "@/components/history/template-performance";
import { TimeInsights } from "@/components/history/time-insigth";

export default function EmailHistoryInsightsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");
  const [selectedTab, setSelectedTab] = useState("history");

  const {
    emailHistory,
    recipientInsights,
    templatePerformance,
    timeInsights,
    quickStats,
    isLoading,
    error,
    refetch,
  } = useEmailHistoryData(selectedTimeframe);

  if (error) {
    return (
      <div className="space-y-6 py-6 px-4">
        <div className="flex items-center justify-center h-64 text-red-500">
          <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-lg font-medium">Failed to load email history</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Email History & Insights
          </h1>
          <p className="text-gray-500 mt-1">
            Track performance and discover patterns in your email communication
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={quickStats} isLoading={isLoading} />

      {/* Main Content Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history">Email History</TabsTrigger>
          <TabsTrigger value="recipients">Top Recipients</TabsTrigger>
          <TabsTrigger value="templates">Template Performance</TabsTrigger>
          <TabsTrigger value="timing">Best Times</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <EmailHistoryList emails={emailHistory} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="recipients" className="space-y-4">
          <RecipientsInsights
            recipients={recipientInsights}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplatePerformance
            templates={templatePerformance}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <TimeInsights insights={timeInsights} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}