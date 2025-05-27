// @/components/analytics/recent-activity.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Mail, FileText, Eye, Edit } from "lucide-react";

interface ActivityData {
  id: string;
  type: "email_sent" | "template_created" | "email_opened" | "template_edited";
  templateSubject?: string;
  recipientEmail?: string;
  timestamp: string;
  metadata?: any;
}

interface RecentActivityProps {
  data: ActivityData[];
  isLoading?: boolean;
}

export function RecentActivity({
  data,
  isLoading = false,
}: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "email_sent":
        return Mail;
      case "template_created":
        return FileText;
      case "email_opened":
        return Eye;
      case "template_edited":
        return Edit;
      default:
        return Activity;
    }
  };

  const getActivityText = (activity: ActivityData) => {
    switch (activity.type) {
      case "email_sent":
        return "Email sent";
      case "template_created":
        return "Template created";
      case "email_opened":
        return "Email opened";
      case "template_edited":
        return "Template edited";
      default:
        return "Activity";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 animate-pulse"
              >
                <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No recent activity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {data.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {getActivityText(activity)}
                  </p>
                  {activity.templateSubject && (
                    <p className="text-sm text-gray-600 truncate">
                      {activity.templateSubject}
                    </p>
                  )}
                  {activity.recipientEmail && (
                    <p className="text-xs text-gray-500 truncate">
                      To: {activity.recipientEmail}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
