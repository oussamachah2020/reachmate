"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  Archive,
  Star,
  MoreHorizontal,
  Paperclip,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample email data for the preview
const email = {
  id: 1,
  sender: {
    name: "Alex Johnson",
    email: "alex@company.com",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  recipients: [
    { name: "Me", email: "me@company.com" },
    { name: "Marketing Team", email: "marketing@company.com" },
  ],
  subject: "Project Proposal: Q3 Marketing Campaign",
  date: "Today at 10:32 AM",
  content: `
    <p>Hi Team,</p>
    <p>I've attached the proposal for the upcoming marketing campaign that we discussed in our meeting last week.</p>
    <p>The proposal includes:</p>
    <ul>
      <li>Campaign objectives and KPIs</li>
      <li>Target audience analysis</li>
      <li>Content strategy and messaging</li>
      <li>Channel distribution plan</li>
      <li>Budget allocation</li>
      <li>Timeline and milestones</li>
    </ul>
    <p>Please review and provide your feedback by Friday. I'd like to finalize this by early next week so we can begin implementation.</p>
    <p>Let me know if you have any questions or need clarification on any points.</p>
    <p>Best regards,<br>Alex</p>
  `,
  attachments: [
    { name: "Q3_Marketing_Proposal.pdf", size: "2.4 MB", type: "pdf" },
    { name: "Campaign_Budget.xlsx", size: "1.2 MB", type: "excel" },
    { name: "Creative_Assets.zip", size: "8.7 MB", type: "zip" },
  ],
  flagged: true,
  labels: ["Work", "Important", "Marketing", "Q3 Projects"],
};

export function EmailPreview() {
  return (
    <div className="flex w-full h-full flex-col">
      {/* Email preview header */}
      <div className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{email.subject}</h2>
          {email.labels.map((label) => (
            <Badge key={label} variant="outline" className="text-xs">
              {label}
            </Badge>
          ))}
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" title="Previous email">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Next email">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email actions */}
      <div className="flex items-center justify-between border-b bg-white p-2">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-8">
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </Button>
          <Button variant="ghost" size="sm" className="h-8">
            <ReplyAll className="mr-2 h-4 w-4" />
            Reply All
          </Button>
          <Button variant="ghost" size="sm" className="h-8">
            <Forward className="mr-2 h-4 w-4" />
            Forward
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            data-starred={email.flagged}
          >
            <Star
              className="h-4 w-4"
              fill={email.flagged ? "currentColor" : "none"}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Print</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Block sender</DropdownMenuItem>
              <DropdownMenuItem>Report spam</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={email.sender.avatar || "/placeholder.svg"}
                alt={email.sender.name}
              />
              <AvatarFallback>{email.sender.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{email.sender.name}</h3>
                <span className="text-xs text-gray-500">
                  &lt;{email.sender.email}&gt;
                </span>
              </div>
              <div className="text-xs text-gray-500">
                <span>To: </span>
                {email.recipients.map((recipient, index) => (
                  <span key={recipient.email}>
                    {recipient.name}{" "}
                    {index < email.recipients.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-500">{email.date}</div>
            </div>
          </div>
        </div>

        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: email.content }}
        />

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-6 rounded-md border bg-gray-50 p-4">
            <h4 className="mb-2 flex items-center text-sm font-medium text-gray-700">
              <Paperclip className="mr-2 h-4 w-4" />
              Attachments ({email.attachments.length})
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {email.attachments.map((attachment) => (
                <div
                  key={attachment.name}
                  className="flex items-center justify-between rounded-md border bg-white p-2 text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                      <span className="text-xs font-medium uppercase text-gray-500">
                        {attachment.type.slice(0, 3)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{attachment.name}</div>
                      <div className="text-xs text-gray-500">
                        {attachment.size}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
