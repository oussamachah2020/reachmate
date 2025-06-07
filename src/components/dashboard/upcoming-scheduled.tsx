import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ScheduledEmails from "./scheduled-emails";

export function UpcomingScheduled() {


  return (
    <Card className="h-[20.8em] shadow-none relative overflow-hidden">
      <CardHeader>
        <CardTitle>Scheduled Emails</CardTitle>
        <CardDescription>Upcoming scheduled emails</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ScheduledEmails />
      </CardContent>
    </Card>
  );
}
