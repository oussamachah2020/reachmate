import { ActionType } from "@/types/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function canUserPerformAction(
  userId: string,
  actionType: ActionType,
  value: number = 1,
): Promise<{ canProceed: boolean; message?: string }> {
  const userWithPlanAndUsage = await prisma.sender.findUnique({
    where: { id: userId },
    include: { UserPlan: true, Usage: true },
  });

  if (
    !userWithPlanAndUsage ||
    !userWithPlanAndUsage.UserPlan ||
    !userWithPlanAndUsage.Usage
  ) {
    return {
      canProceed: false,
      message: "User, plan, or usage data not found.",
    };
  }

  const { UserPlan: plan, Usage: usage } = userWithPlanAndUsage;

  switch (actionType) {
    case "aiRequest":
      if (usage.aiRequests >= plan.maxAiRequests) {
        return {
          canProceed: false,
          message: "Monthly AI request limit reached.",
        };
      }
      break;
    case "resendRequest":
      if (usage.resendRequests >= plan.maxResendRequests) {
        return {
          canProceed: false,
          message: "Monthly Resend request limit reached.",
        };
      }
      break;
    // case "emailSent":
    //   if (usage.emailsSent >= plan.maxEmailsSent) {
    //     return {
    //       canProceed: false,
    //       message: "Total emails sent limit reached.",
    //     };
    //   }
    //   break;
    case "contactStored":
      if (usage.contactsStored >= plan.maxContactsStored) {
        return {
          canProceed: false,
          message: "Maximum contacts stored limit reached.",
        };
      }
      break;
    case "templateSaved":
      if (usage.templatesSaved >= plan.maxTemplatesStored) {
        return {
          canProceed: false,
          message: "Maximum templates stored limit reached.",
        };
      }
      break;
    // case "attachmentStored":
    //   if (usage.attachmentsStored >= plan.maxAttachmentsStored) {
    //     return {
    //       canProceed: false,
    //       message: "Maximum attachments stored limit reached.",
    //     };
    //   }
    //   break;
    case "storageUsed":
      if (Number(usage.totalStorageUsed) + value > plan.maxStorageUsed) {
        return { canProceed: false, message: "Maximum storage limit reached." };
      }
      break;
    default:
      return { canProceed: false, message: "Unknown action type." };
  }

  return { canProceed: true };
}
