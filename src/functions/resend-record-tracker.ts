import { prisma } from "@/lib/prisma";

export async function UpdateResendUsage(senderId: string) {
  try {
    await prisma.usage.upsert({
      where: { userId: senderId },
      update: {
        resendRequests: { increment: 1 },
      },
      create: {
        userId: senderId,
        resendRequests: 1,
      },
    });

    return "record updated";
  } catch (error) {
    console.error("Error sending email and updating usage:", error);
    return error;
  }
}
