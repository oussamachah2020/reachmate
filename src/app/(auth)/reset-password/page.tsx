"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Lock, ArrowLeft, ShieldCheck, EyeOff, Eye } from "lucide-react";

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
import { toast } from "sonner";
import Logo from "@/../public/logo-2.svg";
import { updateUserPassword } from "@/loaders/auth";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const { password, confirmPassword } = watch();

  // Redirect to sign-in page after successful password reset
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

    if (isSubmitted) {
      redirectTimer = setTimeout(() => {
        router.push("/sign-in");
      }, 1500); // Redirect after 1.5 seconds
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [isSubmitted, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      await updateUserPassword(data.password);

      setIsSubmitted(true);
      toast.success("Password updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsNotMatching = useMemo(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      return true;
    }
    return false;
  }, [password, confirmPassword]);

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
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl text-gray-800">
              {isSubmitted
                ? "Password reset successful"
                : "Reset your password"}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "Your password has been reset successfully"
                : "Create a new password for your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-gray-600">
                  Your password has been reset successfully. You will be
                  redirected to the sign-in page shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-3">
                  <Label
                    htmlFor="password"
                    className={errors.password ? "text-destructive" : ""}
                  >
                    New password
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="****************"
                      className={`pl-10 ${
                        errors.password ? "border-destructive" : ""
                      }`}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        pattern: {
                          value: /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
                          message:
                            "Password must contain a number and a special character",
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Must be at least 8 characters with a number and a special
                      character
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="confirmPassword"
                    className={errors.confirmPassword ? "text-destructive" : ""}
                  >
                    Confirm new password
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="****************"
                      className={`pl-10 ${
                        errors.confirmPassword ? "border-destructive" : ""
                      }`}
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {passwordsNotMatching && (
                  <p className="mt-1 text-sm text-destructive">
                    Passwords not matching
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset password"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center my-3">
            {!isSubmitted && (
              <Link
                href="/sign-in"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/90"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
