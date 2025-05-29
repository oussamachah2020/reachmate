import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

const templates = [
  {
    id: 1,
    name: "Client Welcome",
    description: "Introduction email for new clients",
    lastUsed: "2 days ago",
  },
  {
    id: 2,
    name: "Meeting Follow-up",
    description: "Summary and next steps after meetings",
    lastUsed: "Yesterday",
  },
  {
    id: 3,
    name: "Project Update",
    description: "Weekly project status update",
    lastUsed: "Today",
  },
  {
    id: 4,
    name: "Invoice Reminder",
    description: "Friendly payment reminder",
    lastUsed: "5 days ago",
  },
];

export function EmailTemplates() {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Your saved email templates</CardDescription>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer shadow-none">
              <CardContent className="p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-xs text-gray-500">{template.description}</p>
                <p className="mt-2 text-xs text-gray-400">
                  Last used: {template.lastUsed}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
