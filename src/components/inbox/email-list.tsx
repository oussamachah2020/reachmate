"use client";

import { useEffect, useState } from "react";
import parse from "html-react-parser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Star, Archive, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/zustand/auth.store";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Email } from "@/types/inbox";

interface EmailListProps {
  activeEmail: string | null;
  setActiveEmail: (emailId: string | null) => void;
  emailList: Email[];
  setEmailList: (emails: Email[]) => void;
}

export function EmailList({
  activeEmail,
  setActiveEmail,
  emailList,
  setEmailList,
}: EmailListProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [starredEmails, setStarredEmails] = useState<Set<string>>(new Set());
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchEmails() {
      const { data: emails, error } = await supabase
        .from("email_sent")
        .select(
          `id, sentAt, isRead, archived, 
          category(id, name), tag(id, name), 
          sender(id, firstName, lastName, email), 
          receiver(id, email), 
          attachment(id, fileUrl, fileName, fileType),
          template(id, body, subject)`
        )
        .eq("senderId", user?.id)
        .order("sentAt", { ascending: false });

      if (error || emails === null) {
        toast.error("Error fetching emails");
        return;
      }

      setEmailList(emails as unknown as Email[]);
      if (emails.length > 0) setActiveEmail(emails[0].id);
    }

    fetchEmails();
  }, [user]);

  const toggleEmailSelection = (emailId: string) => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter((id) => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  const toggleAllEmails = () => {
    if (selectedEmails.length === emailList.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emailList.map((email) => email.id));
    }
  };

  const toggleStar = (emailId: string) => {
    const newStarred = new Set(starredEmails);
    if (newStarred.has(emailId)) {
      newStarred.delete(emailId);
    } else {
      newStarred.add(emailId);
    }
    setStarredEmails(newStarred);
  };

  function truncateHtml(html: string, maxLength = 120) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7)
      return date.toLocaleDateString("en-US", { weekday: "short" });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const unreadCount = emailList.filter((email) => !email.isRead).length;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-gray-50/50 px-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={
              selectedEmails.length === emailList.length && emailList.length > 0
            }
            onCheckedChange={toggleAllEmails}
            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedEmails.length > 0 ? (
              <span className="text-green-600">
                {selectedEmails.length} selected
              </span>
            ) : (
              `${emailList.length} emails`
            )}
          </span>
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 text-xs"
            >
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {selectedEmails.length > 0 && (
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <Archive className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {emailList.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-lg font-medium">No emails found</p>
              <p className="text-sm">Your sent emails will appear here</p>
            </div>
          </div>
        ) : (
          emailList.map((email, index) => (
            <div
              key={email.id}
              className={cn(
                "group flex cursor-pointer border-b border-gray-100 px-4 py-3 transition-all duration-150 hover:bg-gray-50/80",
                activeEmail === email.id
                  ? "bg-green-50 border-l-4 border-l-green-500"
                  : "",
                !email.isRead
                  ? "bg-gradient-to-r from-green-50/30 to-transparent"
                  : ""
              )}
              onClick={() => setActiveEmail(email.id)}
            >
              {/* Selection and Star Column */}
              <div className="mr-4 flex flex-col items-center justify-start space-y-3 pt-1">
                <Checkbox
                  checked={selectedEmails.includes(email.id)}
                  onCheckedChange={() => toggleEmailSelection(email.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <button
                  className="text-gray-300 hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.id);
                  }}
                >
                  <Star
                    className={cn(
                      "h-4 w-4 transition-colors",
                      starredEmails.has(email.id)
                        ? "fill-amber-400 text-amber-400"
                        : "hover:fill-amber-100"
                    )}
                  />
                </button>
              </div>

              {/* Avatar */}
              <div className="mr-3 mt-1">
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                  <AvatarImage
                    src="/placeholder.svg"
                    alt={`${email.sender.firstName} ${email.sender.lastName}`}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold">
                    {email.sender.firstName.charAt(0)}
                    {email.sender.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Email Content */}
              <div className="flex-1 min-w-0">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span
                      className={cn(
                        "text-sm font-medium truncate",
                        !email.isRead
                          ? "text-gray-900 font-semibold"
                          : "text-gray-700"
                      )}
                    >
                      {email.sender.firstName} {email.sender.lastName}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      {email.sender.email}
                    </span>
                    {!email.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {email.attachment && email.attachment.length > 0 && (
                      <Paperclip className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-400 font-medium">
                      {formatDate(email.sentAt)}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <h3
                  className={cn(
                    "text-sm mb-2 truncate leading-tight",
                    !email.isRead
                      ? "font-semibold text-gray-900"
                      : "font-medium text-gray-700"
                  )}
                >
                  {email.template?.subject || "No Subject"}
                </h3>

                {/* Preview Text */}
                <p className="text-xs text-gray-500 mb-2 leading-relaxed line-clamp-2">
                  {email.template?.body
                    ? truncateHtml(email.template.body, 140)
                    : "No preview available"}
                </p>

                {/* Tags and Categories */}
                {(email.category || email.tag) && (
                  <div className="flex items-center space-x-2">
                    {email.category && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {email.category.name}
                      </Badge>
                    )}
                    {email.tag && (
                      <Badge
                        variant="outline"
                        className="text-xs border-green-200 text-green-600 bg-green-50"
                      >
                        {email.tag.name}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}