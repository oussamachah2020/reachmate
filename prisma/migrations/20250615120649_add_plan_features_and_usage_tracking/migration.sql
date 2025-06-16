-- Migration: Add plan features and usage tracking for ReachMate
-- Run this SQL in your Supabase SQL editor or create a migration file

-- First, let's safely update the PLAN enum
-- Check current enum values
DO $$ 
BEGIN
    -- Add new enum values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'FREE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PLAN')) THEN
        ALTER TYPE "PLAN" ADD VALUE 'FREE';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PRO' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PLAN')) THEN
        ALTER TYPE "PLAN" ADD VALUE 'PRO';
    END IF;
END $$;

-- Create EMAIL_STATUS enum
CREATE TYPE "EMAIL_STATUS" AS ENUM ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');

-- Create plan_feature table
CREATE TABLE "plan_feature" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan" "PLAN" NOT NULL,
    "maxEmailsPerMonth" INTEGER,
    "maxEmailsPerDay" INTEGER,
    "maxAiGenerationsPerMonth" INTEGER,
    "maxAiGenerationsPerDay" INTEGER,
    "maxContacts" INTEGER,
    "maxTemplates" INTEGER,
    "maxTemplateStorage" INTEGER,
    "maxStorageGB" INTEGER,
    "maxFileSize" INTEGER,
    "maxAttachmentsPerEmail" INTEGER,
    "hasAiTemplateGeneration" BOOLEAN NOT NULL DEFAULT false,
    "hasAiEmailOptimization" BOOLEAN NOT NULL DEFAULT false,
    "hasAiSubjectLines" BOOLEAN NOT NULL DEFAULT false,
    "hasAiPersonalization" BOOLEAN NOT NULL DEFAULT false,
    "hasEmailScheduling" BOOLEAN NOT NULL DEFAULT false,
    "hasEmailTracking" BOOLEAN NOT NULL DEFAULT false,
    "hasCustomDomains" BOOLEAN NOT NULL DEFAULT false,
    "hasBulkEmailing" BOOLEAN NOT NULL DEFAULT false,
    "hasAdvancedAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "hasEmailOpenTracking" BOOLEAN NOT NULL DEFAULT false,
    "hasClickTracking" BOOLEAN NOT NULL DEFAULT false,
    "hasPerformanceReports" BOOLEAN NOT NULL DEFAULT false,
    "hasCrmIntegrations" BOOLEAN NOT NULL DEFAULT false,
    "hasApiAccess" BOOLEAN NOT NULL DEFAULT false,
    "hasWebhooks" BOOLEAN NOT NULL DEFAULT false,
    "hasZapierIntegration" BOOLEAN NOT NULL DEFAULT false,
    "hasCustomBranding" BOOLEAN NOT NULL DEFAULT false,
    "hasDataExport" BOOLEAN NOT NULL DEFAULT false,
    "hasPrioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "monthlyPrice" DECIMAL(10,2),
    "yearlyPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_feature_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on plan
CREATE UNIQUE INDEX "plan_feature_plan_key" ON "plan_feature"("plan");

-- Create user_usage table
CREATE TABLE "user_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "emailsSentCount" INTEGER NOT NULL DEFAULT 0,
    "emailsDeliveredCount" INTEGER NOT NULL DEFAULT 0,
    "emailsBouncedCount" INTEGER NOT NULL DEFAULT 0,
    "emailsClickedCount" INTEGER NOT NULL DEFAULT 0,
    "emailsOpenedCount" INTEGER NOT NULL DEFAULT 0,
    "aiGenerationsUsed" INTEGER NOT NULL DEFAULT 0,
    "aiTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "templatesGenerated" INTEGER NOT NULL DEFAULT 0,
    "emailsOptimized" INTEGER NOT NULL DEFAULT 0,
    "storageUsedMB" INTEGER NOT NULL DEFAULT 0,
    "attachmentsUploaded" INTEGER NOT NULL DEFAULT 0,
    "contactsAdded" INTEGER NOT NULL DEFAULT 0,
    "contactsImported" INTEGER NOT NULL DEFAULT 0,
    "templatesCreated" INTEGER NOT NULL DEFAULT 0,
    "templatesUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_usage_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint and foreign key for user_usage
CREATE UNIQUE INDEX "user_usage_userId_month_year_key" ON "user_usage"("userId", "month", "year");
ALTER TABLE "user_usage" ADD CONSTRAINT "user_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "sender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create daily_usage table
CREATE TABLE "daily_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "emailsSentToday" INTEGER NOT NULL DEFAULT 0,
    "aiGenerationsToday" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_usage_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint and foreign key for daily_usage
CREATE UNIQUE INDEX "daily_usage_userId_date_key" ON "daily_usage"("userId", "date");
ALTER TABLE "daily_usage" ADD CONSTRAINT "daily_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "sender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add new columns to existing tables
ALTER TABLE "email_sent" ADD COLUMN IF NOT EXISTS "resendMessageId" TEXT;
ALTER TABLE "email_sent" ADD COLUMN IF NOT EXISTS "deliveryStatus" "EMAIL_STATUS" DEFAULT 'SENT';
ALTER TABLE "email_sent" ADD COLUMN IF NOT EXISTS "openedAt" TIMESTAMP(3);
ALTER TABLE "email_sent" ADD COLUMN IF NOT EXISTS "clickedAt" TIMESTAMP(3);
ALTER TABLE "email_sent" ADD COLUMN IF NOT EXISTS "bouncedAt" TIMESTAMP(3);
ALTER TABLE "email_sent" ADD COLUMN IF NOT EXISTS "wasAiGenerated" BOOLEAN DEFAULT false;
ALTER TABLE "email_sent" ADD COLUMN IF NOT EXISTS "wasAiOptimized" BOOLEAN DEFAULT false;

ALTER TABLE "template" ADD COLUMN IF NOT EXISTS "wasAiGenerated" BOOLEAN DEFAULT false;
ALTER TABLE "template" ADD COLUMN IF NOT EXISTS "aiPromptUsed" TEXT;

ALTER TABLE "scheduled_email" ADD COLUMN IF NOT EXISTS "wasAiGenerated" BOOLEAN DEFAULT false;

ALTER TABLE "attachment" ADD COLUMN IF NOT EXISTS "supabaseBucket" TEXT;
ALTER TABLE "attachment" ADD COLUMN IF NOT EXISTS "supabasePath" TEXT;

-- Insert default plan features
INSERT INTO "plan_feature" (
    "plan", 
    "maxEmailsPerMonth", "maxEmailsPerDay",
    "maxAiGenerationsPerMonth", "maxAiGenerationsPerDay",
    "maxContacts", "maxTemplates", "maxStorageGB", "maxFileSize",
    "hasAiTemplateGeneration", "hasAiEmailOptimization", "hasAiSubjectLines",
    "hasEmailScheduling", "hasEmailTracking", "hasAdvancedAnalytics",
    "hasCrmIntegrations", "hasCustomBranding", "hasDataExport",
    "monthlyPrice", "yearlyPrice"
) VALUES
-- FREE Plan
(
    'FREE',
    50, 10,              -- 50 emails/month, 10/day
    5, 2,                -- 5 AI generations/month, 2/day  
    25, 3, 1, 5,         -- 25 contacts, 3 templates, 1GB storage, 5MB files
    true, false, false,  -- Basic AI generation only
    true, false, false,  -- Basic scheduling, no tracking/analytics
    false, false, false, -- No integrations, branding, export
    0, 0
),
-- PRO Plan
(
    'PRO',
    NULL, 500,           -- Unlimited emails/month, 500/day
    NULL, 50,            -- Unlimited AI generations/month, 50/day
    NULL, NULL, NULL, 25, -- Unlimited contacts, templates, storage, 25MB files
    true, true, true,    -- All AI features
    true, true, true,    -- All email features
    true, true, true,    -- All integrations and premium features
    19, 190
)
ON CONFLICT ("plan") DO UPDATE SET
    "maxEmailsPerMonth" = EXCLUDED."maxEmailsPerMonth",
    "maxEmailsPerDay" = EXCLUDED."maxEmailsPerDay",
    "maxAiGenerationsPerMonth" = EXCLUDED."maxAiGenerationsPerMonth",
    "maxAiGenerationsPerDay" = EXCLUDED."maxAiGenerationsPerDay",
    "maxContacts" = EXCLUDED."maxContacts",
    "maxTemplates" = EXCLUDED."maxTemplates",
    "maxStorageGB" = EXCLUDED."maxStorageGB",
    "maxFileSize" = EXCLUDED."maxFileSize",
    "hasAiTemplateGeneration" = EXCLUDED."hasAiTemplateGeneration",
    "hasAiEmailOptimization" = EXCLUDED."hasAiEmailOptimization",
    "hasAiSubjectLines" = EXCLUDED."hasAiSubjectLines",
    "hasEmailScheduling" = EXCLUDED."hasEmailScheduling",
    "hasEmailTracking" = EXCLUDED."hasEmailTracking",
    "hasAdvancedAnalytics" = EXCLUDED."hasAdvancedAnalytics",
    "hasCrmIntegrations" = EXCLUDED."hasCrmIntegrations",
    "hasCustomBranding" = EXCLUDED."hasCustomBranding",
    "hasDataExport" = EXCLUDED."hasDataExport",
    "monthlyPrice" = EXCLUDED."monthlyPrice",
    "yearlyPrice" = EXCLUDED."yearlyPrice",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Create trigger to automatically update updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plan_feature_updated_at BEFORE UPDATE ON "plan_feature" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON "user_usage" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_usage_updated_at BEFORE UPDATE ON "daily_usage" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Clean up old enum values if they exist and are not used
-- This is commented out for safety - only run if you're sure no data uses BASIC/ENTERPRISE
/*
DO $$
BEGIN
    -- Check if BASIC or ENTERPRISE are used in any tables
    IF NOT EXISTS (SELECT 1 FROM "user_plan" WHERE plan IN ('BASIC', 'ENTERPRISE')) 
       AND NOT EXISTS (SELECT 1 FROM "payment" WHERE plan IN ('BASIC', 'ENTERPRISE')) THEN
        
        -- Create new enum without old values
        CREATE TYPE "PLAN_NEW" AS ENUM ('FREE', 'PRO');
        
        -- Update tables to use new enum
        ALTER TABLE "user_plan" ALTER COLUMN "plan" TYPE "PLAN_NEW" USING "plan"::text::"PLAN_NEW";
        ALTER TABLE "payment" ALTER COLUMN "plan" TYPE "PLAN_NEW" USING "plan"::text::"PLAN_NEW";
        ALTER TABLE "plan_feature" ALTER COLUMN "plan" TYPE "PLAN_NEW" USING "plan"::text::"PLAN_NEW";
        
        -- Drop old enum and rename new one
        DROP TYPE "PLAN";
        ALTER TYPE "PLAN_NEW" RENAME TO "PLAN";
    END IF;
END $$;
*/