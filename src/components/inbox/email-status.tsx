// components/inbox/email-status.tsx
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Eye,
  MousePointer,
  AlertCircle,
  XCircle,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailStatusProps {
  status:
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "bounced"
    | "complained"
    | "delayed";
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  complainedAt?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmailStatus({
  status,
  deliveredAt,
  openedAt,
  clickedAt,
  bouncedAt,
  complainedAt,
  className,
  size = "sm",
}: EmailStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "sent":
        return {
          icon: Send,
          label: "Sent",
          color: "bg-blue-100 text-blue-700 border-blue-200",
          darkColor: "dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700",
        };
      case "delivered":
        return {
          icon: CheckCircle,
          label: "Delivered",
          color: "bg-green-100 text-green-700 border-green-200",
          darkColor:
            "dark:bg-green-900 dark:text-green-300 dark:border-green-700",
        };
      case "opened":
        return {
          icon: Eye,
          label: "Opened",
          color: "bg-emerald-100 text-emerald-700 border-emerald-200",
          darkColor:
            "dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700",
        };
      case "clicked":
        return {
          icon: MousePointer,
          label: "Clicked",
          color: "bg-purple-100 text-purple-700 border-purple-200",
          darkColor:
            "dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700",
        };
      case "bounced":
        return {
          icon: XCircle,
          label: "Bounced",
          color: "bg-red-100 text-red-700 border-red-200",
          darkColor: "dark:bg-red-900 dark:text-red-300 dark:border-red-700",
        };
      case "complained":
        return {
          icon: AlertCircle,
          label: "Complained",
          color: "bg-orange-100 text-orange-700 border-orange-200",
          darkColor:
            "dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700",
        };
      case "delayed":
        return {
          icon: Clock,
          label: "Delayed",
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          darkColor:
            "dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700",
        };
      default:
        return {
          icon: Send,
          label: "Sent",
          color: "bg-gray-100 text-gray-700 border-gray-200",
          darkColor: "dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const iconSize =
    size === "lg" ? "h-4 w-4" : size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  const textSize = size === "lg" ? "text-sm" : "text-xs";

  // Get the most recent timestamp for tooltip
  const getLatestTimestamp = () => {
    const timestamps = [
      { date: clickedAt, label: "Clicked" },
      { date: openedAt, label: "Opened" },
      { date: deliveredAt, label: "Delivered" },
      { date: bouncedAt, label: "Bounced" },
      { date: complainedAt, label: "Complained" },
    ].filter((t) => t.date);

    if (timestamps.length === 0) return null;

    const latest = timestamps.reduce((latest, current) =>
      new Date(current.date!) > new Date(latest.date!) ? current : latest
    );

    return {
      ...latest,
      formatted: new Date(latest.date!).toLocaleString(),
    };
  };

  const latestEvent = getLatestTimestamp();

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 border font-medium transition-colors",
        config.color,
        config.darkColor,
        className
      )}
      title={
        latestEvent
          ? `${latestEvent.label} at ${latestEvent.formatted}`
          : config.label
      }
    >
      <Icon className={cn(iconSize, "flex-shrink-0")} />
      <span className={textSize}>{config.label}</span>
    </Badge>
  );
}

// Optional: More detailed status component with timeline
export function EmailStatusDetail({
  status,
  deliveredAt,
  openedAt,
  clickedAt,
  bouncedAt,
  complainedAt,
}: EmailStatusProps) {
  const events = [
    {
      date: deliveredAt,
      label: "Delivered",
      icon: CheckCircle,
      color: "text-green-600",
    },
    { date: openedAt, label: "Opened", icon: Eye, color: "text-blue-600" },
    {
      date: clickedAt,
      label: "Clicked",
      icon: MousePointer,
      color: "text-purple-600",
    },
    { date: bouncedAt, label: "Bounced", icon: XCircle, color: "text-red-600" },
    {
      date: complainedAt,
      label: "Complained",
      icon: AlertCircle,
      color: "text-orange-600",
    },
  ].filter((event) => event.date);

  if (events.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Send className="h-4 w-4" />
        <span>Sent</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, index) => {
        const Icon = event.icon;
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Icon className={cn("h-4 w-4", event.color)} />
            <span className="font-medium">{event.label}</span>
            <span className="text-gray-500">
              {new Date(event.date!).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
