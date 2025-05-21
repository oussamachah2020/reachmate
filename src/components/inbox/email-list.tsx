"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample email data
const emails = [
  {
    id: 1,
    sender: {
      name: "Alex Johnson",
      email: "alex@company.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    subject: "Project Proposal: Q3 Marketing Campaign",
    preview:
      "I've attached the proposal for the upcoming marketing campaign that we discussed in our meeting last week. Please review and provide your feedback by Friday.",
    date: "10:32 AM",
    read: false,
    flagged: true,
    hasAttachments: true,
    labels: ["Work", "Important"],
  },
  {
    id: 2,
    sender: {
      name: "Sarah Williams",
      email: "sarah@client.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    subject: "Meeting Reminder: Client Presentation",
    preview:
      "This is a reminder that we have a client presentation scheduled for tomorrow at 2:00 PM. Please make sure to prepare your slides and be ready to present your section.",
    date: "Yesterday",
    read: false,
    flagged: false,
    hasAttachments: false,
    labels: ["Meeting"],
  },
  {
    id: 3,
    sender: {
      name: "Finance Team",
      email: "finance@company.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    subject: "Invoice #1234 - Payment Received",
    preview:
      "Thank you for your payment. This email confirms that we have received your payment for Invoice #1234 dated July 10, 2023. The payment has been applied to your account.",
    date: "Yesterday",
    read: true,
    flagged: false,
    hasAttachments: true,
    labels: ["Finance"],
  },
  {
    id: 4,
    sender: {
      name: "Product Team",
      email: "product@reachmate.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    subject: "New Feature Release: Email Templates",
    preview:
      "We're excited to announce the release of our new email templates feature. This will allow you to create and save templates for common emails, saving you time and ensuring consistency.",
    date: "Jul 12",
    read: true,
    flagged: true,
    hasAttachments: false,
    labels: ["Product", "Announcement"],
  },
  {
    id: 5,
    sender: {
      name: "Michael Chen",
      email: "michael@partner.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    subject: "Request for Information: Partnership Opportunity",
    preview:
      "I'm reaching out to discuss a potential partnership between our companies. We believe there could be significant synergies in our product offerings and would like to explore this further.",
    date: "Jul 10",
    read: false,
    flagged: false,
    hasAttachments: false,
    labels: ["Partnership"],
  },
  {
    id: 6,
    sender: {
      name: "HR Department",
      email: "hr@company.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    subject: "Company Policy Update: Remote Work Guidelines",
    preview:
      "Please review the updated remote work guidelines attached to this email. These changes will take effect starting next month and include new procedures for requesting remote work days.",
    date: "Jul 9",
    read: true,
    flagged: false,
    hasAttachments: true,
    labels: ["HR", "Policy"],
  },
  {
    id: 7,
    sender: {
      name: "Tech Support",
      email: "support@ReachMate.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    subject: "Your Support Ticket #45678 - Status Update",
    preview:
      "We wanted to provide an update on your recent support ticket regarding email delivery issues. Our team has identified the problem and is working on a solution.",
    date: "Jul 8",
    read: true,
    flagged: false,
    hasAttachments: false,
    labels: ["Support"],
  },
  {
    id: 8,
    sender: {
      name: "Marketing Team",
      email: "marketing@company.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    subject: "Social Media Campaign Results - June 2023",
    preview:
      "Attached is the report for our June social media campaigns. We saw a 15% increase in engagement compared to May, with particularly strong performance on LinkedIn.",
    date: "Jul 7",
    read: true,
    flagged: false,
    hasAttachments: true,
    labels: ["Marketing", "Report"],
  },
];

export function EmailList() {
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [activeEmail, setActiveEmail] = useState<number>(1);

  const toggleEmailSelection = (emailId: number) => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter((id) => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  const toggleAllEmails = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map((email) => email.id));
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={
              selectedEmails.length === emails.length && emails.length > 0
            }
            onCheckedChange={toggleAllEmails}
          />
          <span className="text-sm text-gray-500">
            {selectedEmails.length > 0
              ? `${selectedEmails.length} selected`
              : "Select all"}
          </span>
        </div>
      </div>

      <div className="h-[calc(100%-3rem)] overflow-y-auto">
        {emails.map((email) => (
          <div
            key={email.id}
            className={cn(
              "flex cursor-pointer border-b p-4 transition-colors hover:bg-gray-50",
              activeEmail === email.id ? "bg-gray-100" : "",
              !email.read ? "bg-primary/5" : ""
            )}
            onClick={() => setActiveEmail(email.id)}
          >
            <div className="mr-3 flex flex-col items-center space-y-2">
              <Checkbox
                checked={selectedEmails.includes(email.id)}
                onCheckedChange={() => toggleEmailSelection(email.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="text-gray-400 hover:text-yellow-400"
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle star logic would go here
                }}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    email.flagged ? "fill-yellow-400 text-yellow-400" : ""
                  )}
                />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={email.sender.avatar || "/placeholder.svg"}
                      alt={email.sender.name}
                    />
                    <AvatarFallback>
                      {email.sender.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "text-sm",
                      !email.read ? "font-semibold" : ""
                    )}
                  >
                    {email.sender.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{email.date}</span>
              </div>

              <h3
                className={cn(
                  "mt-1 truncate text-sm",
                  !email.read ? "font-semibold" : ""
                )}
              >
                {email.subject}
              </h3>

              <div className="mt-1 flex items-center space-x-2">
                {email.hasAttachments && (
                  <Paperclip className="h-3 w-3 text-gray-400" />
                )}
                {email.labels && email.labels.length > 0 && (
                  <div className="flex space-x-1">
                    {email.labels.slice(0, 2).map((label) => (
                      <Badge
                        key={label}
                        variant="outline"
                        className="px-1 py-0 text-[10px]"
                      >
                        {label}
                      </Badge>
                    ))}
                    {email.labels.length > 2 && (
                      <Badge
                        variant="outline"
                        className="px-1 py-0 text-[10px]"
                      >
                        +{email.labels.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <p className="mt-1 truncate text-xs text-gray-500">
                {email.preview}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
