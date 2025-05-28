import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { RecipientInsight } from "@/types/history";

interface RecipientsInsightsProps {
  recipients: RecipientInsight[];
  isLoading?: boolean;
}

export function RecipientsInsights({
  recipients,
  isLoading,
}: RecipientsInsightsProps) {
  const quickSendEmail = (recipientEmail: string) => {
    window.location.href = `/compose?to=${encodeURIComponent(recipientEmail)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Recipients</CardTitle>
          <CardDescription>Loading recipient insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Recipients</CardTitle>
        <CardDescription>
          Recipients you email most frequently and their engagement rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recipients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No recipient data yet</p>
              <p className="text-sm">Start sending emails to see insights</p>
            </div>
          ) : (
            recipients.map((recipient) => (
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
                      <p className="text-sm text-gray-600">{recipient.email}</p>
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
                        {recipient.averageResponseTime?.toFixed(1)}h
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
