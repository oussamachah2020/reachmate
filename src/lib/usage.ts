// lib/usage.ts
import { prisma } from "@/lib/prisma";
import { PLAN } from "@prisma/client";

// Plan configuration - you could also store this in the database
export const PLAN_LIMITS = {
  FREE: {
    maxAiRequests: 10,
    maxResendRequests: 50,
    maxEmailsSent: 50,
    maxContactsStored: 100,
    maxTemplatesStored: 5,
    maxAttachmentsStored: 10,
    maxStorageUsed: BigInt(104857600), // 100MB
  },
  PRO: {
    maxAiRequests: 1000,
    maxResendRequests: 5000,
    maxEmailsSent: 5000,
    maxContactsStored: 10000,
    maxTemplatesStored: 100,
    maxAttachmentsStored: 200,
    maxStorageUsed: BigInt(10737418240), // 10GB
  },
};

export async function trackUsage(
  userId: string,
  metric:
    | "aiRequests"
    | "resendRequests"
    | "emailsSent"
    | "contactsStored"
    | "templatesGenerated"
    | "templatesSaved"
    | "attachmentsStored",
  value: number = 1,
) {
  try {
    await prisma.usage.upsert({
      where: { userId },
      update: {
        [metric]: { increment: value },
      },
      create: {
        userId,
        [metric]: value,
      },
    });
  } catch (error) {
    console.error(`Error tracking usage for ${metric}:`, error);
  }
}

export async function trackStorageUsage(userId: string, bytes: bigint) {
  try {
    await prisma.usage.upsert({
      where: { userId },
      update: {
        totalStorageUsed: { increment: bytes },
      },
      create: {
        userId,
        totalStorageUsed: bytes,
      },
    });
  } catch (error) {
    console.error("Error tracking storage usage:", error);
  }
}

export async function checkPlanLimits(
  userId: string,
  action: string,
  value: number = 1,
) {
  try {
    // Get user's current usage and plan
    const userData = await prisma.usage.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            UserPlan: true,
          },
        },
      },
    });

    // If no usage record, create default
    if (!userData) {
      await prisma.usage.create({
        data: { userId },
      });
      return; // First usage, allow it
    }

    const userPlan = userData.user.UserPlan;
    if (!userPlan) {
      // No plan found, create default FREE plan
      await prisma.userPlan.create({
        data: {
          userId,
          type: PLAN.FREE,
          ...PLAN_LIMITS.FREE,
        },
      });
      return;
    }

    // Check if plan has expired
    if (userPlan.endDate < new Date()) {
      throw new Error("Your plan has expired. Please upgrade to continue.");
    }

    // Check limits based on action
    switch (action) {
      case "ai_request":
        if (
          userPlan.maxAiRequests !== -1 &&
          userData.aiRequests + value > userPlan.maxAiRequests
        ) {
          throw new Error(
            `AI request limit exceeded. You have used ${userData.aiRequests}/${userPlan.maxAiRequests} requests this month.`,
          );
        }
        break;

      // case "email_send":
      //   if (userPlan.maxEmailsSent !== -1) {
      //     throw new Error(
      //       `Email sending limit exceeded. You have sent ${userData.emailsSent}/${userPlan.maxEmailsSent} emails this month.`,
      //     );
      //   }
      //   break;

      case "template_save":
        if (
          userPlan.maxTemplatesStored !== -1 &&
          userData.templatesSaved + value > userPlan.maxTemplatesStored
        ) {
          throw new Error(
            `Template storage limit exceeded. You have ${userData.templatesSaved}/${userPlan.maxTemplatesStored} templates saved.`,
          );
        }
        break;

      case "contact_store":
        if (
          userPlan.maxContactsStored !== -1 &&
          userData.contactsStored + value > userPlan.maxContactsStored
        ) {
          throw new Error(
            `Contact storage limit exceeded. You have ${userData.contactsStored}/${userPlan.maxContactsStored} contacts stored.`,
          );
        }
        break;

      // case "attachment_store":
      //   if (
      //     userPlan.maxAttachmentsStored !== -1 &&
      //     userData.attachmentsStored + value > userPlan.maxAttachmentsStored
      //   ) {
      //     throw new Error(
      //       `Attachment storage limit exceeded. You have ${userData.attachmentsStored}/${userPlan.maxAttachmentsStored} attachments stored.`,
      //     );
      //   }
      //   break;
    }
  } catch (error) {
    throw error;
  }
}

export async function checkStorageLimit(
  userId: string,
  additionalBytes: bigint,
) {
  try {
    const userData = await prisma.usage.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            UserPlan: true,
          },
        },
      },
    });

    if (!userData?.user.UserPlan) {
      return; // No plan limits
    }

    const userPlan = userData.user.UserPlan;
    if (
      userPlan.maxStorageUsed !== BigInt(-1) &&
      userData.totalStorageUsed + additionalBytes > userPlan.maxStorageUsed
    ) {
      const usedMB = Number(userData.totalStorageUsed) / (1024 * 1024);
      const limitMB = Number(userPlan.maxStorageUsed) / (1024 * 1024);
      throw new Error(
        `Storage limit exceeded. You have used ${usedMB.toFixed(2)}MB/${limitMB}MB of storage.`,
      );
    }
  } catch (error) {
    throw error;
  }
}

export async function getUserUsageStats(userId: string) {
  try {
    const data = await prisma.usage.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            UserPlan: true,
          },
        },
      },
    });

    if (!data) {
      return null;
    }

    const plan = data.user.UserPlan;
    return {
      usage: {
        aiRequests: data.aiRequests,
        templatesSaved: data.templatesSaved,
        contactsStored: data.contactsStored,
        totalStorageUsed: data.totalStorageUsed.toString(),
      },
      limits: plan
        ? {
            maxAiRequests: plan.maxAiRequests,
            maxEmailsSent: plan.maxEmailsSent,
            maxTemplatesStored: plan.maxTemplatesStored,
            maxContactsStored: plan.maxContactsStored,
            maxAttachmentsStored: plan.maxAttachmentsStored,
            maxStorageUsed: plan.maxStorageUsed.toString(),
          }
        : null,
      planType: plan?.type || "FREE",
      planExpiry: plan?.endDate,
    };
  } catch (error) {
    console.error("Error getting usage stats:", error);
    return null;
  }
}

// Helper function to reset monthly usage (call this monthly via cron job)
export async function resetMonthlyUsage() {
  try {
    await prisma.usage.updateMany({
      data: {
        aiRequests: 0,
        resendRequests: 0,
        // Note: Don't reset stored items (contacts, templates, attachments, storage)
        // as these are cumulative, not monthly limits
      },
    });
    console.log("Monthly usage reset completed");
  } catch (error) {
    console.error("Error resetting monthly usage:", error);
  }
}
