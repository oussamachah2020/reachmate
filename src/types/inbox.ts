export interface Email {
  id: string;
  sentAt: string;
  archived: boolean;
  starred: boolean;
  isRead: boolean;
  attachment: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
  }[];
  category: {
    id: string;
    name: string;
  };
  tag: {
    id: string;
    name: string;
  };
  receiver: {
    id: string;
    email: string;
  };
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  template: {
    id: string;
    body: string;
    subject: string;
  };
}

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