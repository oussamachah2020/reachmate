import { Gender } from "@prisma/client";

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: Gender;
}

export interface LoginDto {
  email: string;
  password: string;
}
