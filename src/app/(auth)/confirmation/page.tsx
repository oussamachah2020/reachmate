"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyEmail } from "@/loaders/auth";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/zustand/auth.store";

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  const token = params.get("access_token");
  const type = params.get("type");

  useEffect(() => {
    const insertUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        toast.error("Failed to get session");
        return;
      }

      const { user } = session;

      const { error: insertError } = await supabase.from("sender").upsert({
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.given_name || "FirstName",
        lastName: user.user_metadata?.family_name || "LastName",
        gender: "MALE",
      });

      if (insertError) {
        console.error(insertError);
        toast.error("Error inserting user data");
        return;
      }

      useAuthStore.setState(() => ({ session: session }));
      useAuthStore.setState(() => ({ user: user }));

      toast.success("Welcome!");
      router.push("/home"); // Redirect to home
    };

    insertUser();
  }, [router]);

  // useEffect(() => {
  //   async function confirmEmail() {
  //     if (token && type) {
  //       await verifyEmail(token, type);

  //       setStatus("success");
  //       router.replace("/sign-in");
  //     }
  //   }

  //   confirmEmail();
  // }, [router, token, type]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight ">ReachMate</h1>
          <p className="mt-2 text-sm">Professional email management solution</p>
        </div>

        <Card className="border-gray-200 shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl ">Email Confirmation</CardTitle>
            <CardDescription>
              {status === "loading"
                ? "Verifying your email address..."
                : "Your email has been verified successfully!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {status === "loading" ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm">
                  Please wait while we verify your email address...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm ">
                    Your email has been verified successfully. Redirecting to
                    sign in...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
