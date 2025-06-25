"use client";
import Loader from "@/components/loader";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

type Props = {};

const Page = (props: Props) => {
  const { sender, setSender, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    async function getSenderInfo() {
      const { data, error } = await supabase
        .from("sender")
        .select("firstName, lastName, email")
        .eq("id", user?.id)
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }
      setSender(data);
    }

    getSenderInfo();
  }, [user]);

  useEffect(() => {
    if (sender) {
      router.replace("/home");
    }
  }, [sender]);

  return <Loader />;
};

export default Page;
