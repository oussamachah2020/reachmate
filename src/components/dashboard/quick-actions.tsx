import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Send, Users, FileText } from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and actions</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button className="justify-start" variant="outline">
          <PenLine className="mr-2 h-4 w-4" />
          Compose New Email
        </Button>
        <Button className="justify-start" variant="outline">
          <Send className="mr-2 h-4 w-4" />
          Schedule Email
        </Button>
        <Button className="justify-start" variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Manage Contacts
        </Button>
        <Button className="justify-start" variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </CardContent>
    </Card>
  );
}
