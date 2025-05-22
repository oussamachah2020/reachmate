// // lib/prisma.ts

// import { PrismaClient } from "@prisma/client";

// declare global {
//   // Allow global 'prisma' to prevent multiple instances in development
//   // eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined;
// }

// const prisma =
//   global.prisma ||
//   new PrismaClient({
//     log: ["query"], // Optional: Log queries for debugging
//   });

// if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// export default prisma;
