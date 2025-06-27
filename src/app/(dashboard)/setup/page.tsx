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

    async function fetchAndCheckUsage() {
      try {
        const { data: usage, error: usageError } = await supabase
          .from("usage")
          .select("id")
          .eq("userId", user?.id);

        if (usageError) {
          console.log(usageError);
          return;
        }

        if (usage && usage.length === 0) {
          await supabase.from("usage").insert({
            aiRequests: 0,
            resendRequests: 0,
            contactsStored: 0,
            templatesSaved: 0,
            totalStorageUsed: 0,
            userId: user?.id,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetchAndCheckUsage();
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
