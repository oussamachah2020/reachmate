"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import type { Email } from "@/types/inbox";
import { useAuthStore } from "@/zustand/auth.store";
import {
  Mail,
  Star,
  Archive,
  Paperclip,
  Clock,
  Eye,
  MoreHorizontal,
  Inbox,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RecentEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchRecentEmails() {
      try {
        const { data: emails, error } = await supabase
          .from("email_sent")
          .select(
            `id, sentAt, isRead, archived, starred,
            category(id, name), 
            tag(id, name), 
            sender(id, firstName, lastName, email), 
            receiver(id, email), 
            attachment(id, fileUrl, fileName, fileType),
            template(id, body, subject), default_template(id, body, subject)`
          )
          .eq("senderId", user?.id)
          .eq("archived", false)
          .order("sentAt", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching emails:", error);
          return;
        }

        setEmails(emails as unknown as Email[]);
      } catch (error) {
        console.error("Error fetching emails:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchRecentEmails();
    }
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString(undefined, {
        weekday: "short",
      });
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getPlainTextPreview = (html: string): string => {
    if (!html) return "";
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const text = tempDiv.textContent || tempDiv.innerText || "";
      return text.length > 100 ? text.slice(0, 100) + "..." : text;
    } catch (error) {
      return html.slice(0, 100) + "...";
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start space-x-4 p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        No recent emails
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        Your recent email communications will appear here once you start sending
        emails.
      </p>
    </div>
  );

  return (
    <Card className="shadow-none h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Recent Emails
            </CardTitle>
            <CardDescription>Your latest email communications</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <LoadingSkeleton />
        ) : emails.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`group relative flex cursor-pointer items-start space-x-4 rounded-lg p-3 transition-all duration-200 hover:bg-accent/50 ${
                  !email.isRead
                    ? "bg-primary/5 border border-primary/10"
                    : "hover:bg-muted/50"
                }`}
                onMouseEnter={() => setHoveredEmail(email.id)}
                onMouseLeave={() => setHoveredEmail(null)}
              >
                {/* Avatar with status indicator */}
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-2 ring-background">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt={`${email.sender.firstName} ${email.sender.lastName}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {email.sender.firstName.charAt(0)}
                      {email.sender.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {!email.isRead && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                  )}
                </div>

                {/* Email content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <h4
                        className={`font-medium truncate ${
                          !email.isRead
                            ? "font-semibold text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {email.sender.firstName} {email.sender.lastName}
                      </h4>
                      {!email.isRead && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 text-xs"
                        >
                          New
                        </Badge>
                      )}
                      {email.attachment && email.attachment.length > 0 && (
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(email.sentAt)}
                      </div>
                    </div>
                  </div>

                  <p
                    className={`text-sm truncate ${
                      !email.isRead
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {email?.template?.subject ||
                      email.default_template?.subject}
                  </p>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {getPlainTextPreview(
                      email?.template?.body ||
                        email.default_template?.body ||
                        ""
                    )}
                  </p>

                  {/* Tags and category */}
                  <div className="flex items-center space-x-2 pt-1">
                    {email.category && (
                      <Badge variant="outline" className="text-xs">
                        {email.category.name}
                      </Badge>
                    )}
                    {email.tag && (
                      <Badge variant="secondary" className="text-xs">
                        {email.tag.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Unread indicator line */}
                {!email.isRead && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
