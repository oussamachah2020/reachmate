"use client";
import { useAuthStore } from "@/zustand/auth.store";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/loader";

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
      router.replace("/setup");
    }
  }, [hasHydrated, session, user]);

  if (!hasHydrated) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default AuthLayout;
