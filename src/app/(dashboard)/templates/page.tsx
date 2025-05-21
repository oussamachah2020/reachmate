import type { Metadata } from "next";
import { TemplatesHeader } from "@/components/templates/templates-header";
import { TemplatesList } from "@/components/templates/templates-list";
import { TemplateCategories } from "@/components/templates/template-categories";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Email Templates | ReachMate",
  description: "Manage your email templates",
};

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <TemplatesHeader />

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <TemplateCategories />
        </div>
        <div className="md:col-span-3">
          <TemplatesList />
        </div>
      </div>
    </div>
  );
}
