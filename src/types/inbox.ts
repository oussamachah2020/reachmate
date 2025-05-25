export interface Email {
  id: string;
  sentAt: string;
  archived: boolean;
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
