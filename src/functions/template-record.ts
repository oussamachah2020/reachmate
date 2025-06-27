import { prisma } from "@/lib/prisma";

export async function updateTemplateUsage(senderId: string) {
  try {
    await prisma.usage.update({
      where: { userId: senderId },
      data: {
        templatesSaved: { increment: 1 },
      },
    });

    return "record updated";
  } catch (error) {
    console.error("Error saving template and updating usage:", error);
  }
}
