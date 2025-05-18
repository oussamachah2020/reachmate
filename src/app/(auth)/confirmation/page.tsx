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

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success">("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("success");

      setTimeout(() => {
        router.push("/sign-in");
      }, 1000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            MailPro
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Professional email management solution
          </p>
        </div>

        <Card className="border-gray-200 shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-gray-800">
              Email Confirmation
            </CardTitle>
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
                <p className="text-sm text-gray-500">
                  Please wait while we verify your email address...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
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
