"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  User,
  Zap,
  Mail,
  FileText,
  HardDrive,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/zustand/auth.store";
import { ModeToggle } from "../mode-toggle";
import { useRouter } from "next/navigation";
import { PLAN, type Usage, type Plan } from "@/types/auth";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const UsageDisplay = ({
  usage,
  plan,
}: {
  usage: Usage | null;
  plan: Plan | null;
}) => {
  if (!usage || !plan) {
    return (
      <Card className="w-80">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-20">
            <div className="text-sm text-muted-foreground">
              Usage data not available
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getUsagePercentage = (used: number, max: number) => {
    return Math.min((used / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-green-500";
  };

  const usageItems = [
    {
      icon: Zap,
      label: "AI Requests",
      used: usage.aiRequests,
      max: plan.maxAiRequests,
      color: "bg-blue-500",
    },
    {
      icon: Mail,
      label: "Resend Requests",
      used: usage.resendRequests,
      max: plan.maxResendRequests,
      color: "bg-green-500",
    },
    {
      icon: FileText,
      label: "Templates Saved",
      used: usage.templatesSaved,
      max: plan.maxTemplatesStored,
      color: "bg-purple-500",
    },
    {
      icon: HardDrive,
      label: "Storage Used",
      used: usage.totalStorageUsed,
      max: plan.maxStorageUsed,
      color: "bg-orange-500",
      isStorage: true,
    },
  ];

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Usage Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageItems.map((item) => {
          const percentage = getUsagePercentage(item.used, item.max);
          const Icon = item.icon;

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Badge
                  variant={
                    percentage >= 90
                      ? "destructive"
                      : percentage >= 75
                        ? "secondary"
                        : "outline"
                  }
                  className="text-xs"
                >
                  {item.isStorage
                    ? `${formatBytes(item.used)} / ${formatBytes(item.max)}`
                    : `${item.used} / ${item.max}`}
                </Badge>
              </div>
              <div className="space-y-1">
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage.toFixed(1)}% used</span>
                  <span className={getUsageColor(percentage)}>
                    {percentage >= 90
                      ? "Critical"
                      : percentage >= 75
                        ? "High"
                        : "Good"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {plan.type === PLAN.FREE && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Upgrade to increase your limits
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, plan, usage, setUsage, clearAuth } = useAuthStore();
  const router = useRouter();
  const [loadingUsage, setLoadingUsage] = useState(true);


  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingUsage(true);
      try {
        const { data: usage, error: usageError } = await supabase
          .from("usage")
          .select(
            "aiRequests, resendRequests, contactsStored, templatesSaved, totalStorageUsed"
          )
          .eq("userId", user?.id)
          .single();

        if (usageError) {
          toast.error(usageError.message);
          return;
        }

        setUsage(usage);
      } catch (error) {
        console.error("Error in Header fetching user data:", error);
      } finally {
        setLoadingUsage(false);
      }
    };

    if (user && !usage) {
      fetchUserData();
    }

    const channel = supabase
      .channel(`usage-updates-${user?.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "usage",
          filter: `userId=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.new) {
            setUsage(payload.new as any);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function signOut() {
    if (user?.is_anonymous === true) {
      const { error } = await supabase
        .from("sender")
        .delete()
        .eq("id", user.id);
      if (error) {
        console.error("Error deleting anonymous user:", error.message);
      }
    }
    clearAuth();
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Error signing out from Supabase:", signOutError.message);
    }
  }

  // Determine avatar source and fallback display
  const avatarSrc =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "/placeholder.svg?height=32&width=32";
  const avatarFallbackContent =
    user?.user_metadata &&
    typeof user.user_metadata.displayName === "string" &&
    user.user_metadata.displayName.length > 0 ? (
      user.user_metadata.displayName[0]
    ) : (
      <User className="h-3 w-3" />
    );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 md:px-6 glassmorphism">
      <div className="hidden md:block md:w-1/3 ">
        <div className="flex flex-row items-center gap-3 w-full">
          <SidebarTrigger />

          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search emails..."
              className="w-full rounded-md border pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <ModeToggle />
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <TrendingUp className="h-5 w-5" />
              {usage && plan && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
                >
                  {Math.round(
                    ((usage.aiRequests / plan.maxAiRequests +
                      usage.resendRequests / plan.maxResendRequests +
                      usage.templatesSaved / plan.maxTemplatesStored +
                      usage.totalStorageUsed / plan.maxStorageUsed) /
                      4) *
                      100,
                  )}
                  %
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-0">
            <UsageDisplay usage={usage} plan={plan} />
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="User" />
                <AvatarFallback className="text-md bg-primary text-white">
                  {avatarFallbackContent}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-500">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Badge
          variant={plan?.type === PLAN.FREE ? "secondary" : "default"}
          className="text-sm"
        >
          {plan?.type || "Loading..."}
        </Badge>

        {plan?.type === PLAN.FREE ? (
          <Button
            onClick={() => router.push("/upgrade")}
            className="text-gray-200 h-7 bg-secondary"
          >
            Upgrade
          </Button>
        ) : null}
      </div>
    </header>
  );
}
