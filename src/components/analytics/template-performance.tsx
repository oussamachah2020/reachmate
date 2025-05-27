// @/components/analytics/template-performance.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface TemplateData {
  id: string;
  subject: string;
  category?: string;
  usage: number;
  openRate: number;
  responseRate: number;
}

interface TemplatePerformanceProps {
  data: TemplateData[];
  isLoading?: boolean;
}

export function TemplatePerformance({
  data,
  isLoading = false,
}: TemplatePerformanceProps) {
  if (isLoading) {
    return (
      <Card className="lg:col-span-2 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Top Performing Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse"
              >
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="flex items-center space-x-4">
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 w-12 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
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
      <Card className="lg:col-span-2 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Top Performing Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-lg font-medium">No templates found</p>
              <p className="text-sm">
                Create templates to see performance data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Top Performing Templates</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((template, index) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {template.subject || "Untitled Template"}
                </h4>
                <div className="flex items-center space-x-4 mt-1">
                  {template.category && (
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    Used {template.usage} times
                  </span>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-green-600">
                  {template.openRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Open Rate</div>
                {template.responseRate > 0 && (
                  <div className="text-sm text-blue-600 mt-1">
                    {template.responseRate.toFixed(1)}% Response
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
