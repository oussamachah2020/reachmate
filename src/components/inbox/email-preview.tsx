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
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Email } from "@/types/inbox";

interface EmailPreviewProps {
  activeEmail: string | null;
  emailList: Email[];
}

export function EmailPreview({ activeEmail, emailList }: EmailPreviewProps) {
  const currentEmail = emailList.find((email) => email.id === activeEmail);

  const currentIndex = emailList.findIndex((email) => email.id === activeEmail);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < emailList.length - 1;

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.target = "_blank";

      try {
        const response = await fetch(fileUrl);
        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          link.href = objectUrl;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(objectUrl);
        } else {
          window.open(fileUrl, "_blank");
        }
      } catch (fetchError) {
        window.open(fileUrl, "_blank");
      }
    } catch (error) {
      console.error("Download failed:", error);
      window.open(fileUrl, "_blank");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }
    if (diffDays === 2) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!currentEmail) {
    return (
      <div className="flex w-full h-full flex-col items-center justify-center ">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No email selected
            </h3>
            <p className="text-sm text-gray-500">
              Choose an email from the list to view its contents
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full flex-col ">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Button variant="ghost" size="icon" className="md:hidden">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold truncate">
            {currentEmail.template?.subject || "No Subject"}
          </h2>
          <div className="flex items-center space-x-2">
            {currentEmail.category && (
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {currentEmail.category.name}
              </Badge>
            )}
            {currentEmail.tag && (
              <Badge
                variant="outline"
                className="text-xs border-green-200 text-green-600 bg-green-50 dark:border-green-700 dark:text-green-400 dark:bg-green-900"
              >
                {currentEmail.tag.name}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            title="Previous email"
            disabled={!canGoPrevious}
            className="disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Next email"
            disabled={!canGoNext}
            className="disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b  p-2">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-8 ">
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </Button>
          <Button variant="ghost" size="sm" className="h-8 ">
            <ReplyAll className="mr-2 h-4 w-4" />
            Reply All
          </Button>
          <Button variant="ghost" size="sm" className="h-8 ">
            <Forward className="mr-2 h-4 w-4" />
            Forward
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-100"
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-amber-50"
          >
            <Star className="h-4 w-4 hover:text-amber-500" />
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
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
              <AvatarImage
                src="/placeholder.svg"
                alt={`${currentEmail.sender.firstName} ${currentEmail.sender.lastName}`}
              />
              <AvatarFallback className="text-white bg-gradient-to-br from-green-500 to-emerald-600  font-semibold">
                {currentEmail.sender.firstName.charAt(0)}
                {currentEmail.sender.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold ">
                  {currentEmail.sender.firstName} {currentEmail.sender.lastName}
                </h3>
                <span className="text-sm ">
                  &lt;{currentEmail.sender.email}&gt;
                </span>
              </div>
              <div className="text-sm ">
                <span className="font-medium">To: </span>
                <span>{currentEmail.receiver.email}</span>
              </div>
              <div className="text-sm ">{formatDate(currentEmail.sentAt)}</div>
            </div>
          </div>
          {!currentEmail.isRead && (
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
          )}
        </div>

        {/* Email body */}
        <div className="prose prose-sm max-w-none">
          {currentEmail.template?.body ? (
            <div
              className="leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: currentEmail.message,
              }}
            />
          ) : (
            <div className=" italic">No content available for this email.</div>
          )}
        </div>

        {/* Attachments */}
        {currentEmail.attachment && currentEmail.attachment.length > 0 && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <h4 className="mb-3 flex items-center text-sm font-semibold">
              <Paperclip className="mr-2 h-4 w-4" />
              Attachments ({currentEmail.attachment.length})
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {currentEmail.attachment.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3 text-sm shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <span className="text-xs font-bold uppercase">
                        {attachment.fileType?.slice(0, 3) || "DOC"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {attachment.fileName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {attachment.fileType}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8  hover:text-green-600 hover:bg-green-50"
                    onClick={() =>
                      handleDownload(attachment.fileUrl, attachment.fileName)
                    }
                    title={`Download ${attachment.fileName}`}
                  >
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