import type { Metadata } from "next";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentEmails } from "@/components/dashboard/recent-emails";
import { EmailTemplates } from "@/components/dashboard/email-templates";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { UpcomingScheduled } from "@/components/dashboard/upcoming-scheduled";

export const metadata: Metadata = {
  title: "Dashboard | ReachMate",
  description: "Manage your email campaigns and communications",
};

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        Dashboard
      </h1>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <RecentEmails />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <UpcomingScheduled />
        </div>
      </div>

      <EmailTemplates />
    </div>
  );
}
