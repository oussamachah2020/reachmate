import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const recentEmails = [
  {
    id: 1,
    subject: "Project Proposal: Q3 Marketing Campaign",
    preview:
      "I've attached the proposal for the upcoming marketing campaign...",
    sender: {
      name: "Alex Johnson",
      email: "alex@company.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "10:32 AM",
    read: true,
  },
  {
    id: 2,
    subject: "Meeting Reminder: Client Presentation",
    preview:
      "This is a reminder that we have a client presentation scheduled...",
    sender: {
      name: "Sarah Williams",
      email: "sarah@client.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "Yesterday",
    read: false,
  },
  {
    id: 3,
    subject: "Invoice #1234 - Payment Received",
    preview:
      "Thank you for your payment. This email confirms that we have received...",
    sender: {
      name: "Finance Team",
      email: "finance@company.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "Yesterday",
    read: true,
  },
  {
    id: 4,
    subject: "New Feature Release: Email Templates",
    preview:
      "We're excited to announce the release of our new email templates feature...",
    sender: {
      name: "Product Team",
      email: "product@ReachMate.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "Jul 12",
    read: true,
  },
  {
    id: 5,
    subject: "Request for Information: Partnership Opportunity",
    preview:
      "I'm reaching out to discuss a potential partnership between our companies...",
    sender: {
      name: "Michael Chen",
      email: "michael@partner.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "Jul 10",
    read: false,
  },
];

export function RecentEmails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Emails</CardTitle>
        <CardDescription>Your latest email communications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEmails.map((email) => (
            <div
              key={email.id}
              className={`flex cursor-pointer items-start space-x-4 rounded-md p-3 transition-colors hover:bg-gray-100 ${
                !email.read ? "bg-primary/5" : ""
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={email.sender.avatar || "/placeholder.svg"}
                  alt={email.sender.name}
                />
                <AvatarFallback>{email.sender.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4
                      className={`font-medium ${
                        !email.read ? "font-semibold" : ""
                      }`}
                    >
                      {email.sender.name}
                    </h4>
                    {!email.read && (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary"
                      >
                        New
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{email.date}</span>
                </div>
                <p className={`text-sm ${!email.read ? "font-medium" : ""}`}>
                  {email.subject}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {email.preview}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
