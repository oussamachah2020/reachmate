"use client";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { ScheduledEmail } from "@prisma/client";
import { CalendarClock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { format } from "date-fns";

type Props = {};

const ScheduledEmails = (props: Props) => {
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchScheduledEmails() {
      try {
        const { data, error } = await supabase
          .from("scheduled_email")
          .select("id, subject, toEmail, priority, scheduledAt, sent");

        if (error) {
          toast.error(error.message);
          return;
        }

        setScheduledEmails(data as unknown as ScheduledEmail[]);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching scheduled emails");
      }
    }

    fetchScheduledEmails();
  }, [user]);
  return (
    <div className="space-y-4 h-[13rem] overflow-auto">
      {scheduledEmails.map((email) => (
        <div key={email.id} className="flex items-start space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <CalendarClock className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">{email.subject}</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {email.toEmail}
              </Badge>
              <span className="text-xs text-gray-500">
                {format(new Date(email.scheduledAt), "Pp")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduledEmails;
