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