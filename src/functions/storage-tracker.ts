import { prisma } from "@/lib/prisma";

export async function updateStorageUsage(senderId: string, size: number) {
  try {
    await prisma.usage.update({
      where: { userId: senderId },
      data: {
        totalStorageUsed: { increment: size },
      },
    });

    return "record updated";
  } catch (error) {
    console.error("Error storing attachment and updating usage:", error);
  } finally {
    await prisma.$disconnect();
  }
}
