"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/zustand/auth.store";
import Cookies from "js-cookie";
import { Session } from "@supabase/supabase-js";
import Loader from "@/components/loader";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { session, user, setAuth } = useAuthStore();
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!session) {
      const sessionCookie = Cookies.get("auth-session");
      if (sessionCookie) {
        try {
          const parsedSession: Session = JSON.parse(sessionCookie);
          setAuth(parsedSession, parsedSession.user);
        } catch (err) {
          console.error(err);
        }
      }
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !session && !user) {
      router.replace("/sign-in");
    }
  }, [hasHydrated, session, user]);

  if (!hasHydrated) {
    return <Loader />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <Header />
        <main className="w-full my-5 px-5">{children}</main>
      </div>
    </SidebarProvider>
  );
}
