"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Send, Eye, Users, Download, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";

// Import components
import { StatCard } from "@/components/analytics/stat-card";
import { CategoryBreakdownChart } from "@/components/analytics/category-breakdown-chart";
import { TemplatePerformance } from "@/components/analytics/template-performance";
import { RecentActivity } from "@/components/analytics/recent-activity";
import { EmailTrendsChart } from "@/components/analytics/emails-trends-chart";

interface AnalyticsData {
  overview: {
    totalEmails: number;
    emailsThisMonth: number;
    totalTemplates: number;
    activeTemplates: number;
    openRate: number;
    responseRate: number;
    previousMonthEmails: number;
    previousOpenRate: number;
    previousResponseRate: number;
  };
  emailTrends: Array<{
    date: string;
    sent: number;
    opened: number;
    responded: number;
  }>;
  templateUsage: Array<{
    id: string;
    subject: string;
    category?: string;
    usage: number;
    openRate: number;
    responseRate: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    color: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    type:
      | "email_sent"
      | "template_created"
      | "email_opened"
      | "template_edited";
    templateSubject?: string;
    recipientEmail?: string;
    timestamp: string;
  }>;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("sent");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const categoryColors = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ];

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching analytics for user:", user.id);

      // Calculate date ranges
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Fetch overview data with correct field names from Prisma schema
      const [
        totalEmailsResult,
        thisMonthEmailsResult,
        previousMonthEmailsResult,
        templatesResult,
        categoriesResult,
      ] = await Promise.all([
        // Total emails sent by this user
        supabase
          .from("email_sent")
          .select("id", { count: "exact", head: true })
          .eq("senderId", user.id),

        // This month's emails
        supabase
          .from("email_sent")
          .select("id, isRead")
          .eq("senderId", user.id)
          .gte("sentAt", currentMonth.toISOString()),

        // Previous month's emails for comparison
        supabase
          .from("email_sent")
          .select("id, isRead")
          .eq("senderId", user.id)
          .gte("sentAt", previousMonth.toISOString())
          .lt("sentAt", currentMonth.toISOString()),

        // Templates created by this user
        supabase
          .from("template")
          .select("id", { count: "exact", head: true })
          .eq("senderId", user.id),

        // Categories created by this user
        supabase.from("category").select("id, name").eq("authorId", user.id),
      ]);

      console.log("Overview results:", {
        totalEmails: totalEmailsResult.count,
        thisMonthEmails: thisMonthEmailsResult.data?.length,
        previousMonthEmails: previousMonthEmailsResult.data?.length,
        totalTemplates: templatesResult.count,
        categories: categoriesResult.data?.length,
      });

      // Calculate open rates
      const thisMonthEmails = thisMonthEmailsResult.data || [];
      const previousMonthEmails = previousMonthEmailsResult.data || [];

      const thisMonthOpenRate =
        thisMonthEmails.length > 0
          ? (thisMonthEmails.filter((email) => email.isRead).length /
              thisMonthEmails.length) *
            100
          : 0;

      const previousMonthOpenRate =
        previousMonthEmails.length > 0
          ? (previousMonthEmails.filter((email) => email.isRead).length /
              previousMonthEmails.length) *
            100
          : 0;

      // Fetch email trends data (last 6 months)
      const emailTrendsResult = await supabase
        .from("email_sent")
        .select("sentAt, isRead")
        .eq("senderId", user.id)
        .gte(
          "sentAt",
          new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order("sentAt", { ascending: true });

      console.log(
        "Email trends data:",
        emailTrendsResult.data?.length || 0,
        "emails"
      );

      // Process trends data
      const trendsMap = new Map();
      emailTrendsResult.data?.forEach((email) => {
        const date = new Date(email.sentAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!trendsMap.has(monthKey)) {
          trendsMap.set(monthKey, {
            date: monthKey,
            sent: 0,
            opened: 0,
            responded: 0,
          });
        }

        const monthData = trendsMap.get(monthKey);
        monthData.sent++;
        if (email.isRead) monthData.opened++;
        // Note: Add responded tracking when implemented
      });

      const emailTrends = Array.from(trendsMap.values()).slice(-6);
      console.log("Processed email trends:", emailTrends);

      // First, get all templates without relations to check basic data
      const templatesBasicResult = await supabase
        .from("template")
        .select("id, subject, body, usedCount, categoryId")
        .eq("senderId", user.id);

      console.log("Basic templates:", templatesBasicResult.data);

      // Then get categories separately if needed
      let templateUsage: any[] = [];

      if (templatesBasicResult.data && templatesBasicResult.data.length > 0) {
        // Get email counts for each template
        templateUsage = await Promise.all(
          templatesBasicResult.data.map(async (template) => {
            const { data: emailData } = await supabase
              .from("email_sent")
              .select("id, isRead")
              .eq("templateId", template.id);

            const usage = emailData?.length || 0;
            const opened =
              emailData?.filter((email) => email.isRead).length || 0;
            const openRate = usage > 0 ? (opened / usage) * 100 : 0;

            // Get category name if categoryId exists
            let categoryName = "Uncategorized";
            if (template.categoryId) {
              const { data: categoryData } = await supabase
                .from("category")
                .select("name")
                .eq("id", template.categoryId)
                .single();

              if (categoryData) {
                categoryName = categoryData.name;
              }
            }

            return {
              id: template.id,
              subject: template.subject || "Untitled Template",
              category: categoryName,
              usage,
              openRate,
              responseRate: 0, // Implement response tracking later
            };
          })
        );

        templateUsage = templateUsage
          .sort((a, b) => b.usage - a.usage)
          .slice(0, 5);
      }

      // Fetch category breakdown - get emails with categoryId directly
      const categoryEmailsResult = await supabase
        .from("email_sent")
        .select("id, categoryId")
        .eq("senderId", user.id)
        .not("categoryId", "is", null);

      const categoryMap = new Map();
      let totalCategorizedEmails = 0;

      if (categoryEmailsResult.data) {
        // Group by categoryId first
        const categoryIds = [
          ...new Set(
            categoryEmailsResult.data.map((email) => email.categoryId)
          ),
        ];

        for (const categoryId of categoryIds) {
          if (categoryId) {
            const { data: categoryData } = await supabase
              .from("category")
              .select("name")
              .eq("id", categoryId)
              .single();

            if (categoryData) {
              const count = categoryEmailsResult.data.filter(
                (email) => email.categoryId === categoryId
              ).length;
              categoryMap.set(categoryData.name, count);
              totalCategorizedEmails += count;
            }
          }
        }
      }

      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([name, count], index) => ({
          name,
          count: count as number,
          value:
            totalCategorizedEmails > 0
              ? Number(((count as number) / totalCategorizedEmails) * 100)
              : 0,
          color: categoryColors[index % categoryColors.length],
        }))
        .sort((a, b) => b.count - a.count);

      // Fetch recent activity - get basic email data first
      const recentActivityResult = await supabase
        .from("email_sent")
        .select("id, sentAt, isRead, templateId, receiverId")
        .eq("senderId", user.id)
        .order("sentAt", { ascending: false })
        .limit(10);

      let recentActivity: any[] = [];

      if (recentActivityResult.data) {
        recentActivity = await Promise.all(
          recentActivityResult.data.map(async (email) => {
            // Get template subject
            let templateSubject = "No Subject";
            if (email.templateId) {
              const { data: templateData } = await supabase
                .from("template")
                .select("subject")
                .eq("id", email.templateId)
                .single();

              if (templateData) {
                templateSubject = templateData.subject || "No Subject";
              }
            }

            // Get receiver email
            let recipientEmail;
            if (email.receiverId) {
              const { data: receiverData } = await supabase
                .from("user")
                .select("email")
                .eq("id", email.receiverId)
                .single();

              if (receiverData) {
                recipientEmail = receiverData.email;
              }
            }

            return {
              id: email.id,
              type: "email_sent" as const,
              templateSubject,
              recipientEmail,
              timestamp: email.sentAt,
            };
          })
        );
      }

      // Compile all data
      const analyticsData: AnalyticsData = {
        overview: {
          totalEmails: totalEmailsResult.count || 0,
          emailsThisMonth: thisMonthEmailsResult.data?.length || 0,
          totalTemplates: templatesResult.count || 0,
          activeTemplates: templatesResult.count || 0,
          openRate: thisMonthOpenRate,
          responseRate: 0, // Implement response tracking
          previousMonthEmails: previousMonthEmailsResult.data?.length || 0,
          previousOpenRate: previousMonthOpenRate,
          previousResponseRate: 0,
        },
        emailTrends,
        templateUsage,
        categoryBreakdown,
        recentActivity,
      };

      setAnalyticsData(analyticsData);
    } catch (error) {
      setError("Failed to load analytics data");
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [user?.id, timeRange]);

  const calculateChange = (
    current: number,
    previous: number
  ): { change: string; type: "positive" | "negative" } => {
    if (previous === 0) return { change: "+100%", type: "positive" };
    const changePercent = ((current - previous) / previous) * 100;
    return {
      change: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}%`,
      type: changePercent >= 0 ? "positive" : "negative",
    };
  };

  const handleExport = async () => {
    if (!analyticsData) return;

    const csvData = [
      ["Metric", "Value"],
      ["Total Emails", analyticsData.overview.totalEmails],
      ["Emails This Month", analyticsData.overview.emailsThisMonth],
      ["Open Rate", `${analyticsData.overview.openRate.toFixed(2)}%`],
      ["Response Rate", `${analyticsData.overview.responseRate.toFixed(2)}%`],
      ["Total Templates", analyticsData.overview.totalTemplates],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Analytics data exported successfully");
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
    toast.success("Analytics data refreshed");
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div className="space-y-6 py-6 px-2">
        <div className="flex items-center justify-center h-64 text-red-500">
          <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-lg font-medium">Failed to load analytics</p>
            <p className="text-sm">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!analyticsData && isLoading) {
    return (
      <div className="space-y-6 py-6 px-2 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const overviewChange = {
    emailsThisMonth: calculateChange(
      analyticsData.overview.emailsThisMonth,
      analyticsData.overview.previousMonthEmails
    ),
    openRate: calculateChange(
      analyticsData.overview.openRate,
      analyticsData.overview.previousOpenRate
    ),
    responseRate: calculateChange(
      analyticsData.overview.responseRate,
      analyticsData.overview.previousResponseRate
    ),
  };

  return (
    <div className="space-y-6 py-6 px-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold ">Analytics</h1>
          <p className="mt-1">
            Track your email performance and template usage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Send}
          title="Total Emails Sent"
          value={analyticsData.overview.totalEmails.toLocaleString()}
          change="+12.5%"
          changeType="positive"
        />
        <StatCard
          icon={Mail}
          title="This Month"
          value={analyticsData.overview.emailsThisMonth}
          change={overviewChange.emailsThisMonth.change}
          changeType={overviewChange.emailsThisMonth.type}
        />
        <StatCard
          icon={Eye}
          title="Open Rate"
          value={`${analyticsData.overview.openRate.toFixed(1)}%`}
          change={overviewChange.openRate.change}
          changeType={overviewChange.openRate.type}
        />
        <StatCard
          icon={Users}
          title="Response Rate"
          value={`${analyticsData.overview.responseRate.toFixed(1)}%`}
          change={overviewChange.responseRate.change}
          changeType={overviewChange.responseRate.type}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EmailTrendsChart
          data={analyticsData.emailTrends}
          selectedMetric={selectedMetric}
          onMetricChange={setSelectedMetric}
          isLoading={false}
        />
        <CategoryBreakdownChart
          data={analyticsData.categoryBreakdown}
          isLoading={false}
        />
      </div>

      {/* Template Performance and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <TemplatePerformance
          data={analyticsData.templateUsage}
          isLoading={false}
        />
        <RecentActivity data={analyticsData.recentActivity} isLoading={false} />
      </div>

      {!isLoading && analyticsData.overview.totalEmails === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-gray-400 mb-4">
              Start sending emails to see your analytics data
            </p>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/inbox")}
            >
              Go to Inbox
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}