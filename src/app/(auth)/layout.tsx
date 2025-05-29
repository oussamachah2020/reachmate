"use client";
import { useAuthStore } from "@/zustand/auth.store";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import Cookies from "js-cookie";

type Props = {
  children: ReactNode;
};

const AuthLayout = ({ children }: Props) => {
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
    if (hasHydrated && session && user) {
      router.replace("/home");
    }
  }, [hasHydrated, session, user]);

  if (!hasHydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-green-600 text-lg font-medium">
          Loading your inbox...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLayout;
