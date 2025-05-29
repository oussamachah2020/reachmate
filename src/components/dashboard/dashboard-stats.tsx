"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, Users, BarChart2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import clsx from "clsx";

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalEmails: 0,
    sentToday: 0,
    activeContacts: 0,
    openRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const today = new Date().toISOString().split("T")[0];

      const { count: totalEmails } = await supabase
        .from("email_sent")
        .select("id", { count: "exact", head: true });

      const { count: sentToday } = await supabase
        .from("email_sent")
        .select("id", { count: "exact", head: true })
        .gte("sentAt", `${today}T00:00:00`)
        .lte("sentAt", `${today}T23:59:59`);

      const { count: activeContacts } = await supabase
        .from("receiver")
        .select("id", { count: "exact", head: true });

      const { count: readCount } = await supabase
        .from("email_sent")
        .select("id", { count: "exact", head: true })
        .eq("isRead", true);

      const openRate =
        totalEmails && readCount
          ? ((readCount / totalEmails) * 100).toFixed(1)
          : "0";

      setStats({
        totalEmails: totalEmails || 0,
        sentToday: sentToday || 0,
        activeContacts: activeContacts || 0,
        openRate: parseFloat(openRate),
      });

      setLoading(false);
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Emails",
      icon: <Mail className="w-4 h-4" />,
      value: stats.totalEmails,
    },
    {
      title: "Sent Today",
      icon: <Send className="w-4 h-4" />,
      value: stats.sentToday,
    },
    {
      title: "Active Contacts",
      icon: <Users className="w-4 h-4" />,
      value: stats.activeContacts,
    },
    {
      title: "Open Rate",
      icon: <BarChart2 className="w-4 h-4" />,
      value: `${stats.openRate}%`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {card.icon}
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold">{card.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
