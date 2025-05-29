import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Star } from "lucide-react";
import { TimeInsight } from "@/types/history";

interface TimeInsightsProps {
  insights: TimeInsight[];
  isLoading?: boolean;
}

export function TimeInsights({ insights, isLoading }: TimeInsightsProps) {
  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Best Times to Send</CardTitle>
          <CardDescription>Loading timing insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Best Times to Send</CardTitle>
        <CardDescription>
          Discover when your emails get the best engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No timing data yet</p>
              <p className="text-sm">Send more emails to see timing insights</p>
            </div>
          ) : (
            insights.map((insight) => (
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
                      <span className="ml-2 font-semibold">{insight.sent}</span>
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
