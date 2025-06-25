"use client";

import { useEffect, useState } from "react";
import { Bell, Search, User } from "lucide-react";
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
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/zustand/auth.store";
import { ModeToggle } from "../mode-toggle";
import { useRouter } from "next/navigation";
import { PLAN } from "@/types/auth";
import { supabase } from "@/lib/supabase/client";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const logout = useAuthStore.getState().clearAuth;
  const { user, plan } = useAuthStore();
  const router = useRouter();

  async function signOut() {
    if (user?.is_anonymous === true) {
      await supabase.from("sender").delete().eq("id", user.id);
    }

    logout();
  }

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
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="User"
                />
                <AvatarFallback className="text-md bg-primary text-white">
                  {user?.user_metadata && user.user_metadata.displayName ? (
                    user?.user_metadata.displayName[0]
                  ) : (
                    <User className="h-3 w-3" />
                  )}
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
        <span className="border border-gray-400 px-3 py-0.5 rounded-md text-sm">
          {plan?.type}
        </span>
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
