"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  Mail,
  Send,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Calendar,
  Activity,
  Download,
  Filter,
} from "lucide-react";

// Mock data - replace with real data from your Supabase queries
const mockData = {
  overview: {
    totalEmails: 1247,
    emailsThisMonth: 182,
    totalTemplates: 34,
    activeTemplates: 28,
    openRate: 68.5,
    responseRate: 23.2,
  },
  emailTrends: [
    { date: "2024-01", sent: 45, opened: 32, responded: 12 },
    { date: "2024-02", sent: 52, opened: 38, responded: 15 },
    { date: "2024-03", sent: 61, opened: 42, responded: 18 },
    { date: "2024-04", sent: 58, opened: 41, responded: 16 },
    { date: "2024-05", sent: 73, opened: 51, responded: 22 },
    { date: "2024-06", sent: 68, opened: 47, responded: 19 },
  ],
  templateUsage: [
    {
      name: "Welcome Email",
      usage: 45,
      category: "Onboarding",
      performance: 78,
    },
    { name: "Follow-up", usage: 38, category: "Sales", performance: 65 },
    { name: "Newsletter", usage: 32, category: "Marketing", performance: 72 },
    { name: "Product Update", usage: 28, category: "Product", performance: 82 },
    {
      name: "Support Response",
      usage: 24,
      category: "Support",
      performance: 91,
    },
  ],
  categoryBreakdown: [
    { name: "Marketing", value: 35, color: "#22c55e" },
    { name: "Sales", value: 28, color: "#3b82f6" },
    { name: "Support", value: 20, color: "#f59e0b" },
    { name: "Product", value: 12, color: "#ef4444" },
    { name: "Onboarding", value: 5, color: "#8b5cf6" },
  ],
  recentActivity: [
    {
      action: "Email sent",
      template: "Welcome Email",
      recipient: "john@example.com",
      time: "2 minutes ago",
    },
    {
      action: "Template created",
      template: "New Product Launch",
      recipient: null,
      time: "1 hour ago",
    },
    {
      action: "Email opened",
      template: "Follow-up",
      recipient: "sarah@company.com",
      time: "3 hours ago",
    },
    {
      action: "Template edited",
      template: "Newsletter",
      recipient: null,
      time: "5 hours ago",
    },
  ],
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>; // Lucide icon component type
  title: string; // Card title
  value: string | number; // Main metric value
  change?: string; // Optional percentage change
  changeType?: "positive" | "negative"; // Optional change direction
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("sent");

  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    changeType,
  }: StatCardProps) => (
    <Card className="shadow-none">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <div className="text-sm font-medium text-gray-600">{title}</div>
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

  return (
    <div className="space-y-6 py-6 px-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">
            Track your email performance and template usage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
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
          <Button variant="outline" size="sm">
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
          value={mockData.overview.totalEmails.toLocaleString()}
          change="+12.5%"
          changeType="positive"
        />
        <StatCard
          icon={Mail}
          title="This Month"
          value={mockData.overview.emailsThisMonth}
          change="+8.2%"
          changeType="positive"
        />
        <StatCard
          icon={Eye}
          title="Open Rate"
          value={`${mockData.overview.openRate}%`}
          change="+2.1%"
          changeType="positive"
        />
        <StatCard
          icon={Users}
          title="Response Rate"
          value={`${mockData.overview.responseRate}%`}
          change="-1.3%"
          changeType="negative"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Trends */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Email Performance Trends</span>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-24">
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
              <AreaChart data={mockData.emailTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="#22c55e"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Email Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mockData.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {mockData.categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                  <span className="text-sm font-medium">{category.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Performance and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Templates */}
        <Card className="lg:col-span-2 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Top Performing Templates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.templateUsage.map((template, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {template.name}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Used {template.usage} times
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {template.performance}%
                    </div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.template}
                    </p>
                    {activity.recipient && (
                      <p className="text-xs text-gray-500 truncate">
                        To: {activity.recipient}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Monthly Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mockData.emailTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
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
    </div>
  );
}
