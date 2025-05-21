export type Tag = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Template = {
  id: string;
  subject: string;
  description: string | null;
  body: string;
  category: Category | null;
  tag: Tag | null;
  createdAt: string;
  updatedAt: string;
  usedCount?: number;
};

export type DuplicationDto = {
  subject: string;
  description: string;
  body: string;
  categoryId: string;
  tagId: string;
};
