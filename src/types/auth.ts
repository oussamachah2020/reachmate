export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // gender: Gender;
}

export interface LoginDto {
  email: string;
  password: string;
}

export enum PLAN {
  FREE = "FREE",
  PRO = "PRO",
}

export type ActionType =
  | "aiRequest"
  | "resendRequest"
  | "emailSent"
  | "contactStored"
  | "templateSaved"
  | "attachmentStored"
  | "storageUsed";

export type Sender = {
  firstName: string;
  lastName: string;
  email: string;
};

export type Plan = {
  id: string;
  type: PLAN;
  startDate: string; // Typically ISO string for date objects over network
  endDate: string;
  maxAiRequests: number;
  maxResendRequests: number;
  maxContactsStored: number;
  maxTemplatesStored: number;
  maxStorageUsed: number; // Prisma BigInt will typically be number in JS/TS
};

export type Usage = {
  aiRequests: number;
  resendRequests: number;
  contactsStored: number;
  templatesSaved: number;
  totalStorageUsed: number;
};
