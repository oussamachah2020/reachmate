"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  RefreshCcw,
  Archive,
  Trash2,
  Tag,
  MoreHorizontal,
  Mail,
  MailOpen,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { Email } from "@/types/inbox";
import EmailSendingDialog from "./email-sending-dialog";
import { ConfirmationAlert } from "../confirmation-alert";

type Props = {
  unreadCount: number;
  selectedEmails: string[];
  emailList: Email[];
  setEmailList: (emails: Email[]) => void;
  onRefresh: () => void;
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
};

export function InboxHeader({
  unreadCount,
  selectedEmails,
  emailList,
  setEmailList,
  onRefresh,
  onSearch,
  onFilter,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const { user } = useAuthStore();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilter = (value: string) => {
    onFilter(value);
  };

  // Mark all emails as read
  const handleMarkAllAsRead = async () => {
    try {
      const unreadEmailIds = emailList
        .filter((email) => !email.isRead)
        .map((email) => email.id);

      if (unreadEmailIds.length === 0) {
        toast.info("All emails are already read");
        return;
      }

      const { error } = await supabase
        .from("email_sent")
        .update({ isRead: true })
        .in("id", unreadEmailIds);

      if (error) throw error;

      // Update local state
      setEmailList(emailList.map((email) => ({ ...email, isRead: true })));
      toast.success(`${unreadEmailIds.length} emails marked as read`);
    } catch (error) {
      console.error("Error marking emails as read:", error);
      toast.error("Failed to mark emails as read");
    }
  };

  // Mark selected emails as unread
  const handleMarkSelectedAsUnread = async () => {
    if (selectedEmails.length === 0) {
      toast.info("No emails selected");
      return;
    }

    try {
      const { error } = await supabase
        .from("email_sent")
        .update({ isRead: false })
        .in("id", selectedEmails);

      if (error) throw error;

      // Update local state
      setEmailList(
        emailList.map((email) =>
          selectedEmails.includes(email.id)
            ? { ...email, isRead: false }
            : email
        )
      );
      toast.success(`${selectedEmails.length} emails marked as unread`);
    } catch (error) {
      console.error("Error marking emails as unread:", error);
      toast.error("Failed to mark emails as unread");
    }
  };

  // Archive selected emails
  const handleArchiveSelected = async () => {
    if (selectedEmails.length === 0) {
      toast.info("No emails selected");
      return;
    }

    try {
      const { error } = await supabase
        .from("email_sent")
        .update({ archived: true })
        .in("id", selectedEmails);

      if (error) throw error;

      // Remove archived emails from local state
      setEmailList(
        emailList.filter((email) => !selectedEmails.includes(email.id))
      );
      toast.success(`${selectedEmails.length} emails archived`);
    } catch (error) {
      console.error("Error archiving emails:", error);
      toast.error("Failed to archive emails");
    }
  };

  // Delete selected emails
  const handleDeleteSelected = async () => {
    if (selectedEmails.length === 0) {
      toast.info("No emails selected");
      return;
    }

    try {
      const { error } = await supabase
        .from("email_sent")
        .delete()
        .in("id", selectedEmails);

      if (error) throw error;

      // Remove deleted emails from local state
      setEmailList(
        emailList.filter((email) => !selectedEmails.includes(email.id))
      );
      toast.success(`${selectedEmails.length} emails deleted`);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting emails:", error);
      toast.error("Failed to delete emails");
    }
  };

  // Star/unstar selected emails
  const handleToggleStarSelected = async (starred: boolean) => {
    if (selectedEmails.length === 0) {
      toast.info("No emails selected");
      return;
    }

    try {
      // Note: You'll need to add a 'starred' column to your email_sent table
      const { error } = await supabase
        .from("email_sent")
        .update({ starred })
        .in("id", selectedEmails);

      if (error) throw error;

      // Update local state
      setEmailList(
        emailList.map((email) =>
          selectedEmails.includes(email.id) ? { ...email, starred } : email
        )
      );

      toast.success(
        `${selectedEmails.length} emails ${starred ? "starred" : "unstarred"}`
      );
    } catch (error) {
      console.error("Error updating star status:", error);
      toast.error("Failed to update star status");
    }
  };

  return (
    <div className="border-b bg-white p-4">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-2">
          <EmailSendingDialog />
          <h1 className="text-xl font-bold">Inbox</h1>
          {unreadCount > 0 ? (
            <div className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {unreadCount} unread
            </div>
          ) : null}
          {selectedEmails.length > 0 && (
            <div className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
              {selectedEmails.length} selected
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center space-x-2 md:mx-4 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search emails..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select defaultValue="all" onValueChange={handleFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All emails</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="starred">Starred</SelectItem>
              <SelectItem value="attachments">With attachments</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            title="Refresh"
            onClick={onRefresh}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Archive Selected"
            onClick={handleArchiveSelected}
            disabled={selectedEmails.length === 0}
          >
            <Archive className="h-4 w-4" />
          </Button>

          <ConfirmationAlert
            isOpen={isDeleteDialogOpen}
            setIsOpen={setIsDeleteDialogOpen}
            action={handleDeleteSelected}
            description={`This action cannot be undone. This will permanently delete ${selectedEmails.length} selected email(s).`}
          />

          <Button
            variant="ghost"
            size="icon"
            title="Star Selected"
            onClick={() => handleToggleStarSelected(true)}
            disabled={selectedEmails.length === 0}
          >
            <Star className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleMarkAllAsRead}>
                <MailOpen className="mr-2 h-4 w-4" />
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleMarkSelectedAsUnread}
                disabled={selectedEmails.length === 0}
              >
                <Mail className="mr-2 h-4 w-4" />
                Mark selected as unread
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleToggleStarSelected(true)}
                disabled={selectedEmails.length === 0}
              >
                <Star className="mr-2 h-4 w-4" />
                Star selected
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleStarSelected(false)}
                disabled={selectedEmails.length === 0}
              >
                <Star className="mr-2 h-4 w-4 fill-current" />
                Unstar selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleArchiveSelected}
                disabled={selectedEmails.length === 0}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}