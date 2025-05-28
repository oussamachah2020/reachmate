export interface EmailHistory {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  templateId?: string;
  templateSubject?: string;
  sentAt: string;
  isRead: boolean;
  isReplied: boolean;
  category?: string;
  status: "sent" | "delivered" | "opened" | "replied" | "failed";
}

export interface RecipientInsight {
  email: string;
  name?: string;
  totalEmails: number;
  openRate: number;
  replyRate: number;
  lastEmailDate: string;
  bestPerformingTemplate?: string;
  averageResponseTime?: number;
  preferredDayOfWeek?: string;
}

export interface TemplatePerformance {
  templateId: string;
  subject: string;
  totalSent: number;
  openRate: number;
  replyRate: number;
  category?: string;
  trend: "up" | "down" | "stable";
  lastUsed: string;
}

export interface TimeInsight {
  period: string;
  sent: number;
  opened: number;
  replied: number;
  openRate: number;
  replyRate: number;
}

export interface QuickStats {
  totalSent: number;
  totalOpened: number;
  totalReplied: number;
  openRate: number;
  replyRate: number;
}
