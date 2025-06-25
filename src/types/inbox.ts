// types/inbox.ts - Update your Email interface
// types/inbox.ts
export type Email = {
  id: string;
  sentAt: string;
  isRead: boolean;
  archived: boolean;
  starred: boolean;
  message: string | null;
  resend_email_id: string | null; // Add this
  email_status: string | null; // Add this
  delivered_at: string;
  opened_at: string;
  clicked_at: string;
  bounced_at: string;
  complained_at: string;
  category: { id: string; name: string } | null;
  tag: { id: string; name: string } | null;
  template: { id: string; body: string; subject: string } | null;
  default_template: { id: string; body: string; subject: string } | null;
  sender: { id: string; firstName: string; lastName: string; email: string };
  receiver: { id: string; email: string };
  attachment: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
  }[];
};

export type Attachment = {
  id: string;
  name: string;
  fileName: string;
  url: string;
  fileUrl: string;
  path: string;
  mimeType: string;
  fileType: string;
  content: string;
};
