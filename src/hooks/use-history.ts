import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import {
  EmailHistory,
  RecipientInsight,
  TemplatePerformance,
  TimeInsight,
  QuickStats,
} from "@/types/history";

export function useEmailHistoryData(timeframe: string) {
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [recipientInsights, setRecipientInsights] = useState<
    RecipientInsight[]
  >([]);
  const [templatePerformance, setTemplatePerformance] = useState<
    TemplatePerformance[]
  >([]);
  const [timeInsights, setTimeInsights] = useState<TimeInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();

  // Calculate date range based on timeframe
  const getDateRange = (days: string) => {
    const now = new Date();
    const daysAgo = new Date(
      now.getTime() - parseInt(days) * 24 * 60 * 60 * 1000
    );
    return daysAgo.toISOString();
  };

  // Fetch email history
  const fetchEmailHistory = async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from("email_sent")
        .select(
          `
          id,
          sentAt,
          isRead,
          receiver (email, firstName, lastName),
          template (id, subject, body),
          category (name)
        `
        )
        .eq("senderId", user.id)
        .gte("sentAt", getDateRange(timeframe))
        .order("sentAt", { ascending: false });

      if (error) throw error;

      return (
        data?.map((email) => ({
          id: email.id,
          recipientEmail: Array.isArray(email.receiver)
            ? email.receiver[0]?.email || "Unknown"
            : (email.receiver as any)?.email || "Unknown",
          recipientName: (() => {
            const receiver = Array.isArray(email.receiver)
              ? email.receiver[0]
              : email.receiver;
            return receiver?.firstName || receiver?.lastName
              ? `${receiver.firstName || ""} ${receiver.lastName || ""}`.trim()
              : undefined;
          })(),
          // FIXED: Handle both array and object cases for template
          subject: (() => {
            const template = Array.isArray(email.template)
              ? email.template[0]
              : email.template;
            return template?.subject || "No Subject";
          })(),
          templateId: (() => {
            const template = Array.isArray(email.template)
              ? email.template[0]
              : email.template;
            return template?.id || undefined;
          })(),
          templateSubject: (() => {
            const template = Array.isArray(email.template)
              ? email.template[0]
              : email.template;
            return template?.subject || undefined;
          })(),
          templateBody: (() => {
            const template = Array.isArray(email.template)
              ? email.template[0]
              : email.template;
            return template?.body || undefined;
          })(),
          sentAt: email.sentAt,
          isRead: email.isRead || false,
          isReplied: false, // TODO: Add reply tracking
          category: (() => {
            const category = Array.isArray(email.category)
              ? email.category[0]
              : email.category;
            return category?.name || undefined;
          })(),
          status: email.isRead ? "opened" : ("sent" as const),
        })) || []
      );
    } catch (error) {
      console.error("Error fetching email history:", error);
      throw error;
    }
  };

  // Helper function to format HTML content for display
  const formatHtmlContent = (htmlContent: string): string => {
    if (!htmlContent) return "";

    return (
      htmlContent
        // Remove HTML tags but preserve line breaks
        .replace(/<p>/g, "")
        .replace(/<\/p>/g, "\n")
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/<li>/g, "• ")
        .replace(/<\/li>/g, "\n")
        .replace(/<ul>/g, "")
        .replace(/<\/ul>/g, "\n")
        .replace(/<ol>/g, "")
        .replace(/<\/ol>/g, "\n")
        .replace(/<[^>]*>/g, "") // Remove all other HTML tags
        .replace(/\n\s*\n/g, "\n") // Remove multiple line breaks
        .trim()
    );
  };

  // Fetch recipient insights
  const fetchRecipientInsights = async () => {
    if (!user?.id) return [];

    try {
      // Get email counts by recipient
      const { data: recipientCounts, error } = await supabase
        .from("email_sent")
        .select(
          `
          receiverId,
          isRead,
          sentAt,
          receiver (email, firstName, lastName)
        `
        )
        .eq("senderId", user.id)
        .gte("sentAt", getDateRange(timeframe));

      if (error) throw error;

      // Group by recipient and calculate stats
      const recipientMap = new Map();

      recipientCounts?.forEach((email) => {
        const receiverId = email.receiverId;
        // FIXED: Receiver is an object, not an array
        const receiverData = email.receiver[0];

        if (!receiverData) return;

        if (!recipientMap.has(receiverId)) {
          recipientMap.set(receiverId, {
            email: receiverData.email,
            name:
              receiverData.firstName && receiverData.lastName
                ? `${receiverData.firstName} ${receiverData.lastName}`
                : receiverData.firstName || receiverData.lastName || undefined,
            totalEmails: 0,
            openedEmails: 0,
            lastEmailDate: email.sentAt,
          });
        }

        const recipient = recipientMap.get(receiverId);
        recipient.totalEmails++;
        if (email.isRead) recipient.openedEmails++;

        // Update last contact date if more recent
        if (new Date(email.sentAt) > new Date(recipient.lastEmailDate)) {
          recipient.lastEmailDate = email.sentAt;
        }
      });

      // Convert to insights format
      return Array.from(recipientMap.values())
        .map((recipient) => ({
          ...recipient,
          openRate:
            recipient.totalEmails > 0
              ? Math.round(
                  (recipient.openedEmails / recipient.totalEmails) * 100
                )
              : 0,
          replyRate: 0, // TODO: Add reply tracking
          averageResponseTime: Math.random() * 24, // Mock data for now
          preferredDayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ][Math.floor(Math.random() * 5)],
        }))
        .sort((a, b) => b.totalEmails - a.totalEmails)
        .slice(0, 10);
    } catch (error) {
      console.error("Error fetching recipient insights:", error);
      throw error;
    }
  };

  // Fetch template performance
  const fetchTemplatePerformance = async () => {
    if (!user?.id) return [];

    try {
      // Get templates with usage stats
      const { data: templates, error } = await supabase
        .from("template")
        .select(
          `
          id,
          subject,
          createdAt,
          category (name)
        `
        )
        .eq("senderId", user.id);

      if (error) throw error;

      // Get email stats for each template
      const templateStats = await Promise.all(
        (templates || []).map(async (template) => {
          const { data: emailStats, error: statsError } = await supabase
            .from("email_sent")
            .select("id, isRead, sentAt")
            .eq("templateId", template.id)
            .gte("sentAt", getDateRange(timeframe));

          if (statsError) {
            console.error("Error fetching template stats:", statsError);
            return null;
          }

          const totalSent = emailStats?.length || 0;
          const totalOpened =
            emailStats?.filter((email) => email.isRead).length || 0;
          const openRate =
            totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

          return {
            templateId: template.id,
            subject: template.subject || "Untitled Template",
            totalSent,
            openRate,
            replyRate: 0, // TODO: Add reply tracking
            category: template.category[0]?.name || undefined,
            trend:
              openRate > 75
                ? "up"
                : openRate < 25
                  ? "down"
                  : ("stable" as const),
            lastUsed:
              emailStats && emailStats.length > 0
                ? emailStats.sort(
                    (a, b) =>
                      new Date(b.sentAt).getTime() -
                      new Date(a.sentAt).getTime()
                  )[0].sentAt
                : template.createdAt,
          };
        })
      );

      return templateStats
        .filter(Boolean)
        .sort((a, b) => b!.totalSent - a!.totalSent)
        .slice(0, 10) as TemplatePerformance[];
    } catch (error) {
      console.error("Error fetching template performance:", error);
      throw error;
    }
  };

  // Fetch time insights
  const fetchTimeInsights = async () => {
    if (!user?.id) return [];

    try {
      const { data: emails, error } = await supabase
        .from("email_sent")
        .select("sentAt, isRead")
        .eq("senderId", user.id)
        .gte("sentAt", getDateRange(timeframe));

      if (error) throw error;

      // Group by day of week
      const dayMap = new Map();
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      emails?.forEach((email) => {
        const date = new Date(email.sentAt);
        const dayName = dayNames[date.getDay()];

        if (!dayMap.has(dayName)) {
          dayMap.set(dayName, { sent: 0, opened: 0, replied: 0 });
        }

        const dayStats = dayMap.get(dayName);
        dayStats.sent++;
        if (email.isRead) dayStats.opened++;
      });

      return Array.from(dayMap.entries()).map(([period, stats]) => ({
        period,
        sent: stats.sent,
        opened: stats.opened,
        replied: stats.replied,
        openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
        replyRate: stats.sent > 0 ? (stats.replied / stats.sent) * 100 : 0,
      }));
    } catch (error) {
      console.error("Error fetching time insights:", error);
      throw error;
    }
  };

  // Load all data
  const loadData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [history, recipients, templates, timing] = await Promise.all([
        fetchEmailHistory(),
        fetchRecipientInsights(),
        fetchTemplatePerformance(),
        fetchTimeInsights(),
      ]);

      setEmailHistory(history as any);
      setRecipientInsights(recipients);
      setTemplatePerformance(templates);
      setTimeInsights(timing);
    } catch (error) {
      console.error("Error loading email history data:", error);
      setError("Failed to load email history data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, timeframe]);

  // Calculate quick stats
  const quickStats: QuickStats = {
    totalSent: emailHistory.length,
    totalOpened: emailHistory.filter((e) => e.isRead).length,
    totalReplied: emailHistory.filter((e) => e.isReplied).length,
    openRate:
      emailHistory.length > 0
        ? (emailHistory.filter((e) => e.isRead).length / emailHistory.length) *
          100
        : 0,
    replyRate:
      emailHistory.length > 0
        ? (emailHistory.filter((e) => e.isReplied).length /
            emailHistory.length) *
          100
        : 0,
  };

  return {
    emailHistory,
    recipientInsights,
    templatePerformance,
    timeInsights,
    quickStats,
    isLoading,
    error,
    refetch: loadData,
  };
}
