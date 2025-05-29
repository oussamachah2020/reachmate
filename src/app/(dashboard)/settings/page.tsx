import { SettingsForm } from "@/components/settings/settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and email preferences.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
