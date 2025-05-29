"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Globe, Moon, Sun } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";

const settingsFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function SettingsForm() {
  const { theme, setTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: "",
      email: user?.email,
    },
  });

  async function onSubmit(data: SettingsFormValues) {
    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Error", {
          description: "You must be logged in to update your profile.",
        });
        return;
      }

      // Update user profile in Supabase auth.users
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: data.name,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Optionally, update a custom profiles table
      const { error: profileError } = await supabase
        .from("sender")
        .update({
          firstName: data.name.split(" ")[0],
          lastName: data.name.split(" ")[1],
          updatedAt: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      toast.success("Profile updated successfully", {
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    async function getSenderData() {
      const { data, error } = await supabase
        .from("sender")
        .select("firstName, lastName")
        .eq("id", user?.id);

      if (error) {
        toast.error("Failed to fetch data");
        return;
      }

      const userData = data[0];

      form.reset({
        name: `${userData.firstName} ${userData.lastName}`,
      });
    }

    getSenderData();
  }, [user]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src="/placeholder.svg?height=64&width=64"
              alt="Profile picture"
            />
            <AvatarFallback className="text-lg">
              {form.getValues("name").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Account Settings</CardTitle>
            <CardDescription>
              Update your profile and customize your experience
            </CardDescription>
            <Badge variant="secondary" className="w-fit">
              Premium Account
            </Badge>
          </div>
        </div>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Profile Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">Profile Information</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          readOnly
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">Theme</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "light",
                    label: "Light",
                    icon: Sun,
                    description: "Clean and bright",
                  },
                  {
                    value: "dark",
                    label: "Dark",
                    icon: Moon,
                    description: "Easy on the eyes",
                  },
                  {
                    value: "system",
                    label: "System",
                    icon: Globe,
                    description: "Matches your device",
                  },
                ].map((themeOption) => {
                  const IconComponent = themeOption.icon;
                  return (
                    <button
                      key={themeOption.value}
                      type="button"
                      onClick={() => setTheme(themeOption.value)}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:bg-accent ${
                        theme === themeOption.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <IconComponent className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium mb-1">
                        {themeOption.label}
                      </span>
                      <span className="text-xs text-muted-foreground text-center">
                        {themeOption.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex mt-4 justify-end">
            <Button
              type="submit"
              className="text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
