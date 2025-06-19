"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paperclip, Star, Archive, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/zustand/auth.store";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Email } from "@/types/inbox";
import { ConfirmationAlert } from "../confirmation-alert";

interface EmailListProps {
  activeEmail: string | null;
  setActiveEmail: (emailId: string | null) => void;
  emailList: Email[];
  setEmailList: (emails: Email[]) => void;
  selectedEmails: string[];
  setSelectedEmails: (emails: string[]) => void;
}

export function EmailList({
  activeEmail,
  setActiveEmail,
  emailList,
  setEmailList,
  selectedEmails,
  setSelectedEmails,
}: EmailListProps) {
  const [starredEmails, setStarredEmails] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Initialize starred emails from the email list
  useEffect(() => {
    const starredSet = new Set<string>();
    emailList.forEach((email) => {
      if (email.starred) {
        starredSet.add(email.id);
      }
    });
    setStarredEmails(starredSet);
  }, [emailList]);

  async function markAsRead(emailId: string) {
    try {
      const { error } = await supabase
        .from("email_sent")
        .update({
          isRead: true,
        })
        .eq("id", emailId);

      if (error) {
        toast.error("Something went wrong, click on the email again please");
        console.error(error);
        return;
      }

      // Update local state
      setEmailList(
        emailList.map((email) =>
          email.id === emailId ? { ...email, isRead: true } : email
        )
      );
    } catch (error) {
      toast.error("Failed to mark this email as read");
      console.error(error);
    }
  }

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

  async function handleArchiving() {
    try {
      if (selectedEmails.length === 0) {
        toast.info("No emails selected");
        return;
      }

      const { error } = await supabase
        .from("email_sent")
        .update({
          archived: true,
        })
        .in("id", selectedEmails);

      if (error) throw error;

      // Remove archived emails from local state
      setEmailList(
        emailList.filter((email) => !selectedEmails.includes(email.id))
      );
      setSelectedEmails([]);
      toast.success(`${selectedEmails.length} emails archived`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to archive the selected emails");
    }
  }

  async function handleDelete() {
    try {
      if (selectedEmails.length === 0) {
        toast.info("No emails selected");
        return;
      }

      const { error } = await supabase
        .from("email_sent")
        .delete()
        .in("id", selectedEmails);

      if (error) throw error;

      // Remove deleted emails from local state
      setEmailList(
        emailList.filter((email) => !selectedEmails.includes(email.id))
      );
      setSelectedEmails([]);
      toast.success(`${selectedEmails.length} emails deleted`);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete the selected emails");
    }
  }

  const toggleStar = async (emailId: string) => {
    const isCurrentlyStarred = starredEmails.has(emailId);
    const newStarred = new Set(starredEmails);

    if (isCurrentlyStarred) {
      newStarred.delete(emailId);
    } else {
      newStarred.add(emailId);
    }

    setStarredEmails(newStarred);

    try {
      const { error } = await supabase
        .from("email_sent")
        .update({ starred: !isCurrentlyStarred })
        .eq("id", emailId);

      if (error) {
        // Revert local state on error
        setStarredEmails(starredEmails);
        throw error;
      }

      // Update local email list state
      setEmailList(
        emailList.map((email) =>
          email.id === emailId
            ? { ...email, starred: !isCurrentlyStarred }
            : email
        )
      );

      toast.success(`Email ${!isCurrentlyStarred ? "starred" : "unstarred"}`);
    } catch (error) {
      console.error("Error updating star status:", error);
      toast.error("Failed to update star status");
    }
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
    <div className="flex h-full flex-col ">
      <div className="flex h-14 items-center justify-between border-b  px-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            defaultChecked={
              selectedEmails?.length === emailList?.length &&
              emailList?.length > 0
            }
            onCheckedChange={toggleAllEmails}
            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
          />
          <span className="text-sm font-medium ">
            {selectedEmails.length > 0 ? (
              <span className="text-green-600">
                {selectedEmails.length} selected
              </span>
            ) : (
              `${emailList.length} emails`
            )}
          </span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className=" text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {selectedEmails.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchiving}
              className="p-2  rounded-md transition-colors"
              title="Archive selected"
            >
              <Archive className="h-4 w-4" />
            </Button>
            <ConfirmationAlert
              isOpen={isDeleteDialogOpen}
              setIsOpen={setIsDeleteDialogOpen}
              action={handleDelete}
              description={`This action cannot be undone. This will permanently delete ${selectedEmails.length} selected email(s).`}
            />
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {emailList.length === 0 ? (
          <div className="flex items-center justify-center h-64 ">
            <div className="text-center">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-lg font-medium">No emails found</p>
              <p className="text-sm">Your emails will appear here</p>
            </div>
          </div>
        ) : (
          emailList.map((email, index) => (
            <div
              key={email.id}
              className={cn(
                "group flex cursor-pointer border-b px-4 py-3 transition-all duration-150",
                activeEmail === email.id
                  ? "bg-green-50 dark:bg-green-900 border-l-4 border-l-green-500"
                  : "",
                !email.isRead
                  ? "bg-gradient-to-r from-green-50/30 to-transparent dark:from-green-900/30"
                  : "",
                selectedEmails.includes(email.id)
                  ? "bg-blue-50 dark:bg-blue-900 border-l-4 border-l-blue-500"
                  : ""
              )}
              onClick={() => {
                setActiveEmail(email.id);
                if (!email.isRead) {
                  markAsRead(email.id);
                }
              }}
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
                  className={cn(
                    "text-gray-300 dark:text-gray-600 hover:text-amber-400 transition-colors",
                    starredEmails.has(email.id)
                      ? "text-amber-400"
                      : "opacity-0 group-hover:opacity-100"
                  )}
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
                <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-gray-800 shadow-sm">
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
                          ? "text-gray-900 dark:text-white font-semibold"
                          : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {email.sender.firstName} {email.sender.lastName}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                      {email.sender.email}
                    </span>
                    {!email.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                    {starredEmails.has(email.id) && (
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {email.attachment && email.attachment.length > 0 && (
                      <Paperclip className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                    )}
                    {email.email_status && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          email.email_status === "delivered" &&
                            "border-blue-200 text-blue-600 bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:bg-blue-900",
                          email.email_status === "opened" &&
                            "border-purple-200 text-purple-600 bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:bg-purple-900",
                          email.email_status === "clicked" &&
                            "border-indigo-200 text-indigo-600 bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:bg-indigo-900",
                          email.email_status === "bounced" &&
                            "border-red-200 text-red-600 bg-red-50 dark:border-red-700 dark:text-red-400 dark:bg-red-900",
                          email.email_status === "complained" &&
                            "border-orange-200 text-orange-600 bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:bg-orange-900"
                        )}
                      >
                        {email.email_status.charAt(0).toUpperCase() +
                          email.email_status.slice(1)}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {formatDate(email.sentAt)}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <h3
                  className={cn(
                    "text-sm mb-2 truncate leading-tight",
                    !email.isRead
                      ? "font-semibold text-gray-900 dark:text-white"
                      : "font-medium text-gray-700 dark:text-gray-300"
                  )}
                >
                  {email.template?.subject || "No Subject"}
                </h3>

                {/* Preview Text */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed line-clamp-2">
                  {email.message
                    ? truncateHtml(email.message, 140)
                    : "No preview available"}
                </p>

                {/* Tags and Categories */}
                {(email.category || email.tag) && (
                  <div className="flex items-center space-x-2">
                    {email.category && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {email.category.name}
                      </Badge>
                    )}
                    {email.tag && (
                      <Badge
                        variant="outline"
                        className="text-xs border-green-200 text-green-600 bg-green-50 dark:border-green-700 dark:text-green-400 dark:bg-green-900"
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