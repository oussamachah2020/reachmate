"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Mail,
  TrendingUp,
  TrendingDown,
  Eye,
  Reply,
  Clock,
  Users,
  Target,
  Calendar,
  Filter,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Star,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";

interface EmailHistory {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  templateId?: string;
  templateSubject?: string;
  sentAt: string;
  isRead: boolean;
  isReplied: boolean;
  category?: string;
  status: "sent" | "delivered" | "opened" | "replied" | "failed";
}

interface RecipientInsight {
  email: string;
  name?: string;
  totalEmails: number;
  openRate: number;
  replyRate: number;
  lastEmailDate: string;
  bestPerformingTemplate?: string;
  averageResponseTime?: number;
  preferredDayOfWeek?: string;
}

interface TemplatePerformance {
  templateId: string;
  subject: string;
  totalSent: number;
  openRate: number;
  replyRate: number;
  category?: string;
  trend: "up" | "down" | "stable";
  lastUsed: string;
}

interface TimeInsight {
  period: string;
  sent: number;
  opened: number;
  replied: number;
  openRate: number;
  replyRate: number;
}

export default function EmailHistoryInsightsPage() {
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [recipientInsights, setRecipientInsights] = useState<
    RecipientInsight[]
  >([]);
  const [templatePerformance, setTemplatePerformance] = useState<
    TemplatePerformance[]
  >([]);
  const [timeInsights, setTimeInsights] = useState<TimeInsight[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");
  const [selectedTab, setSelectedTab] = useState("history");
  const [statusFilter, setStatusFilter] = useState("all");

  const { user } = useAuthStore();

  // Mock data for demonstration
  const mockEmailHistory: EmailHistory[] = [
    {
      id: "1",
      recipientEmail: "john.doe@acme.com",
      recipientName: "John Doe",
      subject: "Follow-up on our conversation",
      templateId: "template-1",
      templateSubject: "Follow-up Template",
      sentAt: "2024-05-25T14:30:00Z",
      isRead: true,
      isReplied: true,
      category: "Follow-up",
      status: "replied",
    },
    {
      id: "2",
      recipientEmail: "jane.smith@techcorp.com",
      recipientName: "Jane Smith",
      subject: "Introduction and Partnership Opportunity",
      templateId: "template-2",
      templateSubject: "Cold Outreach Template",
      sentAt: "2024-05-24T10:15:00Z",
      isRead: true,
      isReplied: false,
      category: "Outreach",
      status: "opened",
    },
    {
      id: "3",
      recipientEmail: "alex.johnson@startup.io",
      subject: "Thank you for your time",
      sentAt: "2024-05-23T16:45:00Z",
      isRead: false,
      isReplied: false,
      category: "Thank You",
      status: "sent",
    },
    {
      id: "4",
      recipientEmail: "sarah.wilson@enterprise.com",
      recipientName: "Sarah Wilson",
      subject: "Proposal Discussion",
      templateId: "template-3",
      templateSubject: "Proposal Template",
      sentAt: "2024-05-22T09:20:00Z",
      isRead: true,
      isReplied: true,
      category: "Business",
      status: "replied",
    },
    {
      id: "5",
      recipientEmail: "mike.brown@company.org",
      subject: "Meeting Confirmation",
      sentAt: "2024-05-21T11:30:00Z",
      isRead: true,
      isReplied: false,
      status: "opened",
    },
  ];

  const mockRecipientInsights: RecipientInsight[] = [
    {
      email: "john.doe@acme.com",
      name: "John Doe",
      totalEmails: 5,
      openRate: 100,
      replyRate: 80,
      lastEmailDate: "2024-05-25T14:30:00Z",
      bestPerformingTemplate: "Follow-up Template",
      averageResponseTime: 2.5,
      preferredDayOfWeek: "Tuesday",
    },
    {
      email: "jane.smith@techcorp.com",
      name: "Jane Smith",
      totalEmails: 3,
      openRate: 67,
      replyRate: 33,
      lastEmailDate: "2024-05-24T10:15:00Z",
      bestPerformingTemplate: "Cold Outreach Template",
      averageResponseTime: 4.2,
      preferredDayOfWeek: "Wednesday",
    },
    {
      email: "sarah.wilson@enterprise.com",
      name: "Sarah Wilson",
      totalEmails: 4,
      openRate: 100,
      replyRate: 75,
      lastEmailDate: "2024-05-22T09:20:00Z",
      bestPerformingTemplate: "Proposal Template",
      averageResponseTime: 1.8,
      preferredDayOfWeek: "Monday",
    },
  ];

  const mockTemplatePerformance: TemplatePerformance[] = [
    {
      templateId: "template-1",
      subject: "Follow-up Template",
      totalSent: 12,
      openRate: 92,
      replyRate: 67,
      category: "Follow-up",
      trend: "up",
      lastUsed: "2024-05-25T14:30:00Z",
    },
    {
      templateId: "template-2",
      subject: "Cold Outreach Template",
      totalSent: 8,
      openRate: 75,
      replyRate: 25,
      category: "Outreach",
      trend: "stable",
      lastUsed: "2024-05-24T10:15:00Z",
    },
    {
      templateId: "template-3",
      subject: "Proposal Template",
      totalSent: 6,
      openRate: 100,
      replyRate: 83,
      category: "Business",
      trend: "up",
      lastUsed: "2024-05-22T09:20:00Z",
    },
  ];

  const mockTimeInsights: TimeInsight[] = [
    {
      period: "Monday",
      sent: 5,
      opened: 4,
      replied: 2,
      openRate: 80,
      replyRate: 40,
    },
    {
      period: "Tuesday",
      sent: 8,
      opened: 7,
      replied: 5,
      openRate: 87.5,
      replyRate: 62.5,
    },
    {
      period: "Wednesday",
      sent: 6,
      opened: 5,
      replied: 2,
      openRate: 83.3,
      replyRate: 33.3,
    },
    {
      period: "Thursday",
      sent: 4,
      opened: 3,
      replied: 2,
      openRate: 75,
      replyRate: 50,
    },
    {
      period: "Friday",
      sent: 3,
      opened: 2,
      replied: 1,
      openRate: 66.7,
      replyRate: 33.3,
    },
  ];

  // Filter email history based on search and filters
  const filteredHistory = emailHistory.filter((email) => {
    const matchesSearch =
      searchTerm === "" ||
      email.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || email.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "replied":
        return "text-green-600 bg-green-100";
      case "opened":
        return "text-blue-600 bg-blue-100";
      case "delivered":
        return "text-yellow-600 bg-yellow-100";
      case "sent":
        return "text-gray-600 bg-gray-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "replied":
        return <Reply className="h-4 w-4" />;
      case "opened":
        return <Eye className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "sent":
        return <Mail className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  // Calculate quick stats
  const quickStats = {
    totalSent: emailHistory.length,
    totalOpened: emailHistory.filter((e) => e.isRead).length,
    totalReplied: emailHistory.filter((e) => e.isReplied).length,
    openRate:
      emailHistory.length > 0
        ? (emailHistory.filter((e) => e.isRead).length / emailHistory.length) *
          100
        : 0,
    replyRate:
      emailHistory.length > 0
        ? (emailHistory.filter((e) => e.isReplied).length /
            emailHistory.length) *
          100
        : 0,
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      // In a real app, you'd fetch from Supabase here
      setTimeout(() => {
        setEmailHistory(mockEmailHistory);
        setRecipientInsights(mockRecipientInsights);
        setTemplatePerformance(mockTemplatePerformance);
        setTimeInsights(mockTimeInsights);
        setIsLoading(false);
      }, 1000);
    };

    loadData();
  }, [selectedTimeframe]);

  // Quick send email to recipient
  const quickSendEmail = (recipientEmail: string) => {
    // Navigate to compose with pre-filled recipient
    window.location.href = `/compose?to=${encodeURIComponent(recipientEmail)}`;
  };

  // Copy email address
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email address copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-6 px-4 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded"></div>
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
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{quickStats.totalSent}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opened</p>
                <p className="text-2xl font-bold">{quickStats.totalOpened}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Replied</p>
                <p className="text-2xl font-bold">{quickStats.totalReplied}</p>
              </div>
              <Reply className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold">
                  {quickStats.openRate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reply Rate</p>
                <p className="text-2xl font-bold">
                  {quickStats.replyRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

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

        {/* Email History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredHistory.map((email) => (
              <Card
                key={email.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              {email.subject}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}
                            >
                              {getStatusIcon(email.status)}
                              <span className="ml-1 capitalize">
                                {email.status}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>
                              To: {email.recipientName || email.recipientEmail}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(email.sentAt).toLocaleDateString()}
                            </span>
                            {email.templateSubject && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">
                                  Template: {email.templateSubject}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => quickSendEmail(email.recipientEmail)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => copyEmail(email.recipientEmail)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => quickSendEmail(email.recipientEmail)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send New Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recipients Insights Tab */}
        <TabsContent value="recipients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Recipients</CardTitle>
              <CardDescription>
                Recipients you email most frequently and their engagement rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipientInsights.map((recipient) => (
                  <div
                    key={recipient.email}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {recipient.name
                              ? recipient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : recipient.email[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {recipient.name || recipient.email}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {recipient.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Emails Sent:</span>
                          <span className="ml-2 font-semibold">
                            {recipient.totalEmails}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Open Rate:</span>
                          <span className="ml-2 font-semibold text-green-600">
                            {recipient.openRate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reply Rate:</span>
                          <span className="ml-2 font-semibold text-blue-600">
                            {recipient.replyRate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Response:</span>
                          <span className="ml-2 font-semibold">
                            {recipient.averageResponseTime}h
                          </span>
                        </div>
                      </div>

                      {recipient.bestPerformingTemplate && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Best Template:</span>
                          <span className="ml-2 text-purple-600 font-medium">
                            {recipient.bestPerformingTemplate}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickSendEmail(recipient.email)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Template Performance Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Performance</CardTitle>
              <CardDescription>
                See which templates are performing best and driving engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templatePerformance.map((template) => (
                  <div
                    key={template.templateId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              {template.subject}
                            </h3>
                            {template.trend === "up" && (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            )}
                            {template.trend === "down" && (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            {template.category && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {template.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Last used:{" "}
                            {new Date(template.lastUsed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Times Used:</span>
                          <span className="ml-2 font-semibold">
                            {template.totalSent}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Open Rate:</span>
                          <span className="ml-2 font-semibold text-green-600">
                            {template.openRate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reply Rate:</span>
                          <span className="ml-2 font-semibold text-blue-600">
                            {template.replyRate}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Insights Tab */}
        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Times to Send</CardTitle>
              <CardDescription>
                Discover when your emails get the best engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeInsights.map((insight) => (
                  <div
                    key={insight.period}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <h3 className="font-semibold text-gray-900">
                            {insight.period}
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Sent:</span>
                          <span className="ml-2 font-semibold">
                            {insight.sent}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Opened:</span>
                          <span className="ml-2 font-semibold">
                            {insight.opened}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Replied:</span>
                          <span className="ml-2 font-semibold">
                            {insight.replied}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Open Rate:</span>
                          <span className="ml-2 font-semibold text-green-600">
                            {insight.openRate.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reply Rate:</span>
                          <span className="ml-2 font-semibold text-blue-600">
                            {insight.replyRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {insight.openRate > 75 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Best Time
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
