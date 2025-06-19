"use client";

import { useState, useEffect, useMemo } from "react";
import { InboxHeader } from "@/components/inbox/inbox-header";
import { EmailList } from "@/components/inbox/email-list";
import { EmailPreview } from "@/components/inbox/email-preview";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Email } from "@/types/inbox";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

export default function InboxPage() {
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [emailList, setEmailList] = useState<Email[]>([]);
  const [allEmails, setAllEmails] = useState<Email[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { user } = useAuthStore();

  const fetchEmails = async () => {
    if (!user?.id) return;

    try {
      const { data: emails, error } = await supabase
        .from("email_sent")
        .select(
          `id, sentAt, isRead, archived, starred, message,
          resend_email_id, email_status, delivered_at, opened_at, 
          clicked_at, bounced_at, complained_at,
          category(id, name), 
          tag(id, name), 
          sender(id, firstName, lastName, email), 
          receiver(id, email), 
          attachment(id, fileUrl, fileName, fileType),
          template(id, body, subject)`
        )
        .or(`senderId.eq.${user.id},receiverId.eq.${user.id}`)
        .eq("archived", false)
        .order("sentAt", { ascending: false });

      if (error) throw error;

      const formattedEmails = emails as unknown as Email[];
      setAllEmails(formattedEmails);

      if (formattedEmails.length > 0 && !activeEmail) {
        setActiveEmail(formattedEmails[0].id);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to fetch emails");
    }
  };

  const filteredEmails = useMemo(() => {
    let filtered = [...allEmails];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          email.template?.subject?.toLowerCase().includes(query) ||
          email.template?.body?.toLowerCase().includes(query) ||
          `${email.sender.firstName} ${email.sender.lastName}`
            .toLowerCase()
            .includes(query) ||
          email.sender.email.toLowerCase().includes(query) ||
          email.category?.name?.toLowerCase().includes(query) ||
          email.tag?.name?.toLowerCase().includes(query) ||
          email.email_status?.toLowerCase().includes(query)
      );
    }

    switch (activeFilter) {
      case "unread":
        filtered = filtered.filter((email) => !email.isRead);
        break;
      case "read":
        filtered = filtered.filter((email) => email.isRead);
        break;
      case "starred":
        filtered = filtered.filter((email) => email.starred);
        break;
      case "attachments":
        filtered = filtered.filter(
          (email) => email.attachment && email.attachment.length > 0
        );
        break;
      case "opened":
        filtered = filtered.filter(
          (email) =>
            email.email_status === "opened" || email.email_status === "clicked"
        );
        break;
      case "delivered":
        filtered = filtered.filter(
          (email) => email.email_status === "delivered"
        );
        break;
      case "bounced":
        filtered = filtered.filter((email) => email.email_status === "bounced");
        break;
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter((email) => new Date(email.sentAt) >= today);
        break;
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(
          (email) => new Date(email.sentAt) >= weekAgo
        );
        break;
      case "month":
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(
          (email) => new Date(email.sentAt) >= monthAgo
        );
        break;
      default:
        break;
    }

    return filtered;
  }, [allEmails, searchQuery, activeFilter]);

  useEffect(() => {
    setEmailList(filteredEmails);
    setSelectedEmails([]);
    if (
      activeEmail &&
      !filteredEmails.find((email) => email.id === activeEmail)
    ) {
      setActiveEmail(filteredEmails.length > 0 ? filteredEmails[0].id : null);
    }
  }, [filteredEmails, activeEmail]);

  const unreadCount = useMemo(
    () => allEmails.filter((email) => !email.isRead).length,
    [allEmails]
  );

  useEffect(() => {
    fetchEmails();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const channel: RealtimeChannel = supabase
      .channel("inbox_email_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "email_sent",
          filter: `senderId=eq.${user.id}`,
        },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          try {
            const { data, error } = await supabase
              .from("email_sent")
              .select(
                `id, sentAt, isRead, archived, starred, message,
                resend_email_id, email_status, delivered_at, opened_at, 
                clicked_at, bounced_at, complained_at,
                category(id, name), 
                tag(id, name), 
                sender(id, firstName, lastName, email), 
                receiver(id, email), 
                attachment(id, fileUrl, fileName, fileType),
                template(id, body, subject)`
              )
              .eq("id", payload.new.id)
              .single();

            if (error) throw error;

            const newEmail = data as unknown as Email;
            setAllEmails((prev) => [newEmail, ...prev]);

            if (!activeEmail) {
              setActiveEmail(newEmail.id);
            }

            toast.success("New email sent!");
          } catch (error) {
            console.error("Error handling email insert:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "email_sent",
          filter: `senderId=eq.${user.id}`,
        },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          try {
            const { data, error } = await supabase
              .from("email_sent")
              .select(
                `id, sentAt, isRead, archived, starred, message,
                resend_email_id, email_status, delivered_at, opened_at, 
                clicked_at, bounced_at, complained_at,
                category(id, name), 
                tag(id, name), 
                sender(id, firstName, lastName, email), 
                receiver(id, email), 
                attachment(id, fileUrl, fileName, fileType),
                template(id, body, subject)`
              )
              .eq("id", payload.new.id)
              .single();

            if (error) {
              setAllEmails((prev) =>
                prev.map((email) =>
                  email.id === payload.new.id
                    ? ({ ...email, ...payload.new } as Email)
                    : email
                )
              );
              return;
            }

            setAllEmails((prev) =>
              prev.map((email) =>
                email.id === payload.new.id ? (data as unknown as Email) : email
              )
            );

            if (
              payload.new.email_status &&
              (payload.old as any).email_status !== payload.new.email_status
            ) {
              const statusMessages = {
                delivered: "📨 Email delivered",
                opened: "👁️ Email opened",
                clicked: "🖱️ Email clicked",
                bounced: "⚠️ Email bounced",
                complained: "❌ Email complained",
              };
              const message =
                statusMessages[
                  payload.new.email_status as keyof typeof statusMessages
                ];
              if (message) {
                toast.info(message);
              }
            }
          } catch (error) {
            console.error("Error handling email update:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "email_sent",
          filter: `senderId=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          try {
            setAllEmails((prev) =>
              prev.filter((email) => email.id !== (payload.old as any).id)
            );

            if (activeEmail === (payload.old as any).id) {
              setActiveEmail(null);
            }

            setSelectedEmails((prev) =>
              prev.filter((id) => id !== (payload.old as any).id)
            );

            toast.info("Email deleted");
          } catch (error) {
            console.error("Error handling email delete:", error);
          }
        }
      )
      .subscribe((status) => {
        console.log("Inbox subscription status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeEmail]);

  useEffect(() => {
    if (!user?.id) return;

    const receivedEmailsChannel: RealtimeChannel = supabase
      .channel("received_email_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "email_sent",
          filter: `receiverId=eq.${user.id}`,
        },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          try {
            const { data, error } = await supabase
              .from("email_sent")
              .select(
                `id, sentAt, isRead, archived, starred, message,
                email_status, delivered_at, opened_at, 
                clicked_at, bounced_at, complained_at,
                category(id, name), 
                tag(id, name), 
                sender(id, firstName, lastName, email), 
                receiver(id, email), 
                attachment(id, fileUrl, fileName, fileType),
                template(id, body, subject)`
              )
              .eq("id", payload.new.id)
              .single();

            if (error) throw error;

            const newEmail = data as unknown as Email;
            setAllEmails((prev) => [newEmail, ...prev]);

            if (!activeEmail) {
              setActiveEmail(newEmail.id);
            }

            toast.success("New email received!");
          } catch (error) {
            console.error("Error handling received email insert:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "email_sent",
          filter: `receiverId=eq.${user.id}`,
        },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          try {
            const { data, error } = await supabase
              .from("email_sent")
              .select(
                `id, sentAt, isRead, archived, starred, message,
                resend_email_id, email_status, delivered_at, opened_at, 
                clicked_at, bounced_at, complained_at,
                category(id, name), 
                tag(id, name), 
                sender(id, firstName, lastName, email), 
                receiver(id, email), 
                attachment(id, fileUrl, fileName, fileType),
                template(id, body, subject)`
              )
              .eq("id", payload.new.id)
              .single();

            if (error) {
              setAllEmails((prev) =>
                prev.map((email) =>
                  email.id === payload.new.id
                    ? ({ ...email, ...payload.new } as Email)
                    : email
                )
              );
              return;
            }

            setAllEmails((prev) =>
              prev.map((email) =>
                email.id === payload.new.id ? (data as unknown as Email) : email
              )
            );
          } catch (error) {
            console.error("Error handling received email update:", error);
          }
        }
      )
      .subscribe((status) => {
        console.log("Received emails subscription status:", status);
      });

    return () => {
      supabase.removeChannel(receivedEmailsChannel);
    };
  }, [user?.id, activeEmail]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleRefresh = () => {
    fetchEmails();
    toast.success("Emails refreshed");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col relative">
      <InboxHeader
        unreadCount={unreadCount}
        selectedEmails={selectedEmails}
        emailList={allEmails}
        setEmailList={setAllEmails}
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        onFilter={handleFilter}
      />
      <ResizablePanelGroup direction="horizontal" className="overflow-hidden">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <EmailList
            activeEmail={activeEmail}
            setActiveEmail={setActiveEmail}
            emailList={emailList}
            setEmailList={setEmailList}
            selectedEmails={selectedEmails}
            setSelectedEmails={setSelectedEmails}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <EmailPreview activeEmail={activeEmail} emailList={emailList} />
        </ResizablePanel>
      </ResizablePanelGroup>
      {!isConnected && (
        <div className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md">
          Realtime connection lost. Attempting to reconnect...
        </div>
      )}
    </div>
  );
}