"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/../public/logo-2.svg";
import { requestPasswordResetEmail } from "@/loaders/auth";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await requestPasswordResetEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center items-center flex-col text-center">
          <img
            src={Logo.src}
            alt="reachmate-logo"
            className="w-[50%] h-[50%]"
          />
          <p className="mt-2 text-sm text-gray-600">
            Professional email management solution
          </p>
        </div>

        <Card className="border-gray-200 shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-gray-800">
              Forgot your password?
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "Check your email for a reset link"
                : "Enter your email address and we'll send you a link to reset your password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-gray-600">
                  We've sent a password reset link to your email address. Please
                  check your inbox.
                </p>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className={errors.email ? "text-destructive" : ""}
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      placeholder="name@company.com"
                      className={`pl-10 ${
                        errors.email ? "border-destructive" : ""
                      }`}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center my-3">
            <Link
              href="/sign-in"
              className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/90"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
