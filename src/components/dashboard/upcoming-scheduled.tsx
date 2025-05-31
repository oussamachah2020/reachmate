import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

const scheduledEmails = [
  {
    id: 1,
    subject: "Weekly Newsletter",
    recipients: "Marketing List (143)",
    scheduledFor: "Tomorrow, 9:00 AM",
  },
  {
    id: 2,
    subject: "Product Launch Announcement",
    recipients: "All Clients (287)",
    scheduledFor: "Jul 18, 10:00 AM",
  },
  {
    id: 3,
    subject: "Quarterly Business Review",
    recipients: "Executive Team (8)",
    scheduledFor: "Jul 21, 2:00 PM",
  },
];

export function UpcomingScheduled() {
  return (
    <Card className="h-[20.8em] shadow-none relative overflow-hidden">
      <CardHeader>
        <CardTitle>Scheduled Emails</CardTitle>
        <CardDescription>Upcoming scheduled emails</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {/* <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-md bg-white/60">
          <span className="text-lg font-medium text-gray-700">Coming Soon</span>
        </div> */}
        <div className="space-y-4">
          {scheduledEmails.map((email) => (
            <div key={email.id} className="flex items-start space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <CalendarClock className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">{email.subject}</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {email.recipients}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {email.scheduledFor}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
