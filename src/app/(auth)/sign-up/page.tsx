"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, EyeOff, Eye } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { signUpUser } from "@/loaders/auth";
import { RegisterDto } from "@/types/auth";
import { toast } from "sonner";
import Logo from "@/../public/logo-2.svg";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  terms: boolean;
}

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>();

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    try {
      const registrationData: RegisterDto = {
        email: data.email,
        password: data.password,
        fullName: `${data.firstName} ${data.lastName}`,
      };

      await signUpUser(registrationData);
      setIsLoading(false);
      toast.success("Account created successfully !");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong, try again !");
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
              Create your account
            </CardTitle>
            <CardDescription>
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="firstName"
                    className={errors.firstName ? "text-destructive" : ""}
                  >
                    First name
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className={`pl-10 ${
                        errors.firstName ? "border-destructive" : ""
                      }`}
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="lastName"
                    className={errors.lastName ? "text-destructive" : ""}
                  >
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className={errors.lastName ? "border-destructive" : ""}
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
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

              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className={errors.password ? "text-destructive" : ""}
                >
                  Password
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="***********"
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  {...register("terms", {
                    required: "You must agree to the terms and privacy policy",
                  })}
                />
                <label
                  htmlFor="terms"
                  className={`text-sm font-medium leading-none ${
                    errors.terms ? "text-destructive" : "text-gray-700"
                  }`}
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:text-primary/90"
                  >
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:text-primary/90"
                  >
                    privacy policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.terms.message}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-4 flex justify-center items-center w-full">
              <div className="w-52 h-0.5 bg-gray-300" />
              <span className="mx-2 text-sm text-gray-400">OR</span>
              <div className="w-52 h-0.5 bg-gray-300" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                Google
              </Button>
              <Button variant="outline" className="w-full">
                Microsoft
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center my-3">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-primary hover:text-primary/90"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
