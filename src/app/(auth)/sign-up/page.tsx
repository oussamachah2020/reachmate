"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, EyeOff, Eye } from "lucide-react";
import { z } from "zod";

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
import { Gender, RegisterDto } from "@/types/auth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .min(2, { message: "Last name must be at least 2 characters" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, {
      message: "Password must contain a number and a special character",
    }),
  // gender: z.nativeEnum(Gender, {
  //   required_error: "Gender is required",
  //   invalid_type_error: "Please select a valid gender",
  // }),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
});

type SignUpFormData = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    try {
      const registrationData: RegisterDto = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        // gender: data.gender,
      };

      await signUpUser(registrationData);
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
        <div className="flex justify-center flex-row items-center gap-3 pt-4">
          <div className="h-16 w-16 rounded-full bg-primary shadow-md flex items-center justify-center">
            <Mail className="h-12 w-12 text-primary-foreground dark:text-white" />
          </div>
          <span className="text-4xl font-semibold dark:text-white">
            ReachMate
          </span>
        </div>

        <Card className="border-gray-200 shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl ">Create your account</CardTitle>
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
                      <User className="h-5 w-5 " />
                    </div>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className={`pl-10 ${
                        errors.firstName ? "border-destructive" : ""
                      }`}
                      {...register("firstName")}
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
                    {...register("lastName")}
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
                    <Mail className="h-5 w-5 " />
                  </div>
                  <Input
                    id="email"
                    placeholder="name@company.com"
                    className={`pl-10 ${
                      errors.email ? "border-destructive" : ""
                    }`}
                    {...register("email")}
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
                    <Lock className="h-5 w-5 " />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="***********"
                    className={`pl-10 pr-10 ${
                      errors.password ? "border-destructive" : ""
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 "
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
                  <p className="text-xs">
                    Must be at least 8 characters with a number and a special
                    character
                  </p>
                )}
              </div>

              {/* <div className="space-y-1">
                <Label
                  htmlFor="gender"
                  className={errors.gender ? "text-destructive" : ""}
                >
                  Gender
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(
                          val === "male" ? Gender.MALE : Gender.FEMALE
                        );
                      }}
                    >
                      <SelectTrigger
                        id="gender"
                        className={`w-full ${
                          errors.gender ? "border-destructive" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Gender.MALE}>Male</SelectItem>
                        <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.gender.message}
                  </p>
                )}
              </div> */}

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="terms"
                    control={control}
                    rules={{
                      required:
                        "You must agree to the terms and privacy policy",
                    }}
                    render={({ field }) => (
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="terms"
                    className={`text-sm font-medium leading-none ${
                      errors.terms ? "text-destructive" : ""
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
              </div>

              <Button
                type="submit"
                className="w-full text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center my-3">
            <p className="text-sm">
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