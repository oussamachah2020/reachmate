"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Send, FileText } from "lucide-react";
import { useState } from "react";
import { CreateTemplateDialog } from "../templates/create-template-dialog";

export function QuickActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Card className="shadow-none relative overflow-hidden">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and actions</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-2 relative">
        {/* Blurred Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-md bg-white/60">
          <span className="text-lg font-medium text-gray-700">Coming Soon</span>
        </div>

        {/* Buttons below the overlay */}
        <div className="pointer-events-none opacity-30">
          <Button
            className="justify-start"
            variant="outline"
            onClick={() => router.push("/compose")}
          >
            <PenLine className="mr-2 h-4 w-4" />
            Compose New Email
          </Button>

          <Button
            className="justify-start"
            variant="outline"
            onClick={() => router.push("/schedule")}
          >
            <Send className="mr-2 h-4 w-4" />
            Schedule Email
          </Button>

          <CreateTemplateDialog
            open={open}
            setOpen={setOpen}
            trigger={
              <Button
                className="justify-start"
                variant="outline"
                onClick={() => setOpen(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
