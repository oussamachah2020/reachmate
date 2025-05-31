"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Send,
  Mail,
  User,
  FileText,
  Timer,
  Zap,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/zustand/auth.store";
import { Priority } from "@prisma/client";

const scheduleFormSchema = z
  .object({
    recipients: z
      .array(z.string().email("Invalid email address"))
      .min(1, "At least one recipient is required"),
    subject: z
      .string()
      .min(1, "Subject is required")
      .max(200, "Subject must be less than 200 characters"),
    body: z.string().min(1, "Email body is required"),
    scheduleType: z.enum(["datetime", "quick"], {
      required_error: "Please select a schedule type",
    }),
    quickOption: z.string().optional(),
    scheduleAt: z.string().min(1, "Schedule time is required"),
    priority: z.enum([Priority.HIGH, Priority.LOW, Priority.NORMAL]),
  })
  .refine(
    (data) => {
      // Validate that schedule time is in the future
      const scheduleDate = new Date(data.scheduleAt);
      const now = new Date();
      return scheduleDate > now;
    },
    {
      message: "Schedule time must be in the future",
      path: ["scheduleAt"],
    }
  );

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const quickScheduleOptions = [
  { value: "15min", label: "In 15 minutes" },
  { value: "1hour", label: "In 1 hour" },
  { value: "tomorrow", label: "Tomorrow 9 AM" },
  { value: "nextweek", label: "Next Monday 9 AM" },
];

// Simple DateTimePicker component since the original might not be available
function DateTimePicker({
  control,
  name,
  disabled,
}: {
  control: any;
  name: string;
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormControl>
          <Input
            type="datetime-local"
            disabled={disabled}
            {...field}
            min={new Date().toISOString().slice(0, 16)}
          />
        </FormControl>
      )}
    />
  );
}

export default function ScheduleEmailPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientInput, setRecipientInput] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      recipients: [],
      subject: "",
      body: "",
      scheduleType: "datetime",
      quickOption: "",
      scheduleAt: "",
      priority: Priority.NORMAL,
    },
    mode: "onChange", // Enable real-time validation
  });

  const watchedScheduleType = form.watch("scheduleType");
  const watchedRecipients = form.watch("recipients");
  const watchedQuickOption = form.watch("quickOption");
  const watchedBody = form.watch("body");
  const watchedSubject = form.watch("subject");
  const watchedPriority = form.watch("priority");
  const watchedScheduleAt = form.watch("scheduleAt");

  // Validate email input in real-time
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(recipientInput));
  }, [recipientInput]);

  // Auto-focus on first input
  useEffect(() => {
    const firstInput = document.querySelector(
      'input[placeholder="Enter email address"]'
    ) as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const addRecipient = () => {
    const email = recipientInput.trim();
    if (!email) return;

    if (!isValidEmail) {
      toast.error("Invalid email address", {
        description: "Please enter a valid email address.",
      });
      return;
    }

    const currentRecipients = form.getValues("recipients");
    if (currentRecipients.includes(email)) {
      toast.error("Email already added", {
        description: "This email address is already in the recipients list.",
      });
      return;
    }

    form.setValue("recipients", [...currentRecipients, email]);
    setRecipientInput("");
    toast.success("Recipient added", {
      description: `${email} has been added to the recipients list.`,
    });
  };

  const removeRecipient = (email: string) => {
    const currentRecipients = form.getValues("recipients");
    form.setValue(
      "recipients",
      currentRecipients.filter((r) => r !== email)
    );
    toast.success("Recipient removed", {
      description: `${email} has been removed from the recipients list.`,
    });
  };

  const handleQuickSchedule = (option: string) => {
    const now = new Date();
    let scheduleDate = new Date();

    switch (option) {
      case "15min":
        scheduleDate = new Date(now.getTime() + 15 * 60 * 1000);
        break;
      case "1hour":
        scheduleDate = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case "tomorrow":
        scheduleDate = new Date(now);
        scheduleDate.setDate(now.getDate() + 1);
        scheduleDate.setHours(9, 0, 0, 0);
        break;
      case "nextweek":
        scheduleDate = new Date(now);
        const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
        scheduleDate.setDate(now.getDate() + daysUntilMonday);
        scheduleDate.setHours(9, 0, 0, 0);
        break;
      default:
        return;
    }

    const isoString = scheduleDate.toISOString().slice(0, 16);
    form.setValue("scheduleAt", isoString);
    form.setValue("quickOption", option);

    // Clear any previous validation errors
    form.clearErrors("scheduleAt");

    toast.success("Schedule time set", {
      description: `Email will be sent ${scheduleDate.toLocaleString()}`,
    });
  };

  const onSubmit = async (data: ScheduleFormValues) => {
    setIsSubmitting(true);

    try {
      // Additional client-side validation
      const scheduleDate = new Date(data.scheduleAt);
      const now = new Date();

      if (scheduleDate <= now) {
        toast.error("Invalid schedule time", {
          description: "Please select a future date and time.",
        });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/schedule-email", {
        method: "POST",
        body: JSON.stringify({ ...data, userId: user?.id }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Email scheduled successfully! 🎉", {
          description: `Your email will be sent to ${data.recipients.length} recipient(s) on ${scheduleDate.toLocaleString()}.`,
          duration: 5000,
        });

        // Reset form
        form.reset();
        setRecipientInput("");
      } else {
        throw new Error(result.error || "Failed to schedule email");
      }
    } catch (error) {
      console.error("Schedule email error:", error);
      toast.error("Failed to schedule email", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to check if form is valid for submission
  const isFormValid = () => {
    return (
      watchedRecipients.length > 0 &&
      watchedSubject.trim() !== "" &&
      watchedBody.trim() !== "" &&
      watchedScheduleAt !== "" &&
      (watchedScheduleType === "datetime" ||
        (watchedScheduleType === "quick" && watchedQuickOption !== ""))
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Send className="h-8 w-8 text-primary" />
          Schedule Email
        </h1>
        <p className="text-muted-foreground mt-2">
          Compose and schedule your email to be sent at the perfect time
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Compose Email
              </CardTitle>
              <CardDescription>
                Fill in the details for your scheduled email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Recipients */}
                  <FormField
                    control={form.control}
                    name="recipients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Recipients
                          {watchedRecipients.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {watchedRecipients.length}
                            </Badge>
                          )}
                        </FormLabel>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                placeholder="Enter email address"
                                value={recipientInput}
                                onChange={(e) =>
                                  setRecipientInput(e.target.value)
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addRecipient();
                                  }
                                }}
                                className={`${
                                  recipientInput && !isValidEmail
                                    ? "border-red-500 focus:border-red-500"
                                    : recipientInput && isValidEmail
                                      ? "border-green-500 focus:border-green-500"
                                      : ""
                                }`}
                              />
                              {recipientInput && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  {isValidEmail ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              )}
                            </div>
                            <Button
                              type="button"
                              onClick={addRecipient}
                              size="icon"
                              variant="outline"
                              disabled={!isValidEmail || !recipientInput.trim()}
                              className={
                                isValidEmail && recipientInput.trim()
                                  ? "border-green-500 text-green-500 hover:bg-green-50"
                                  : ""
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {!isValidEmail && recipientInput && (
                            <p className="text-sm text-red-500">
                              Please enter a valid email address
                            </p>
                          )}
                          {watchedRecipients.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {watchedRecipients.map((email) => (
                                <Badge
                                  key={email}
                                  variant="secondary"
                                  className="flex items-center gap-1 pr-1"
                                >
                                  {email}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                                    onClick={() => removeRecipient(email)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subject */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Subject
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email subject" {...field} />
                        </FormControl>
                        <FormDescription>
                          {field.value.length}/200 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Priority */}
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={Priority.LOW}>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                  Low Priority
                                </div>
                              </SelectItem>
                              <SelectItem value={Priority.NORMAL}>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                                  Normal Priority
                                </div>
                              </SelectItem>
                              <SelectItem value={Priority.HIGH}>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-400" />
                                  High Priority
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Body */}
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your email message..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value.length} characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isFormValid()}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Timer className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : !isFormValid() ? (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Complete Form to Schedule
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Schedule Email
                        {watchedScheduleAt && (
                          <Badge variant="secondary" className="ml-2">
                            {new Date(watchedScheduleAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Settings Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule Settings
              </CardTitle>
              <CardDescription>Choose when to send your email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                {/* Schedule Type */}
                <FormField
                  control={form.control}
                  name="scheduleType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Schedule Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div>
                            <RadioGroupItem
                              value="quick"
                              id="quick"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="quick"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <Zap className="mb-3 h-6 w-6" />
                              Quick
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem
                              value="datetime"
                              id="datetime"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="datetime"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <Calendar className="mb-3 h-6 w-6" />
                              Custom
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quick Schedule Options */}
                {watchedScheduleType === "quick" && (
                  <FormField
                    control={form.control}
                    name="quickOption"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Quick Options</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleQuickSchedule(value);
                            }}
                            value={field.value}
                            className="grid gap-2"
                          >
                            {quickScheduleOptions.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={option.value}
                                />
                                <Label
                                  htmlFor={option.value}
                                  className="flex-1 cursor-pointer"
                                >
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Custom DateTime */}
                <FormField
                  control={form.control}
                  name="scheduleAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchedScheduleType === "quick"
                          ? "Selected Time"
                          : "Schedule Date & Time"}
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          control={form.control}
                          name="scheduleAt"
                          disabled={watchedScheduleType === "quick"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Email Preview
                {isFormValid() ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">
                <strong>To:</strong>{" "}
                <span
                  className={
                    watchedRecipients.length > 0
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {watchedRecipients.length > 0
                    ? `${watchedRecipients.length} recipient(s)`
                    : "No recipients"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Subject:</strong>{" "}
                <span
                  className={watchedSubject ? "text-green-600" : "text-red-500"}
                >
                  {watchedSubject || "No subject"}
                </span>
                {watchedSubject && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({watchedSubject.length}/200)
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Priority:</strong>
                <Badge
                  variant="outline"
                  className={`ml-1 text-xs ${
                    watchedPriority === Priority.HIGH
                      ? "border-red-500 text-red-500"
                      : watchedPriority === Priority.LOW
                        ? "border-gray-500 text-gray-500"
                        : "border-blue-500 text-blue-500"
                  }`}
                >
                  {watchedPriority}
                </Badge>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <strong>Scheduled for:</strong>
                <br />
                <span
                  className={
                    watchedScheduleAt ? "text-green-600" : "text-red-500"
                  }
                >
                  {watchedScheduleAt
                    ? new Date(watchedScheduleAt).toLocaleString()
                    : "Not scheduled"}
                </span>
                {watchedScheduleAt && (
                  <div className="mt-1 text-xs text-gray-400">
                    {(() => {
                      const scheduleDate = new Date(watchedScheduleAt);
                      const now = new Date();
                      const timeDiff = scheduleDate.getTime() - now.getTime();
                      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                      const hours = Math.floor(
                        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                      );
                      const minutes = Math.floor(
                        (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
                      );

                      if (timeDiff <= 0) return "⚠️ Past time";
                      if (days > 0)
                        return `in ${days} day(s) and ${hours} hour(s)`;
                      if (hours > 0)
                        return `in ${hours} hour(s) and ${minutes} minute(s)`;
                      return `in ${minutes} minute(s)`;
                    })()}
                  </div>
                )}
              </div>
              {watchedBody && (
                <>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    <strong>Message Preview:</strong>
                    <div className="mt-1 p-2 bg-muted rounded text-xs max-h-20 overflow-y-auto">
                      {watchedBody.slice(0, 150)}
                      {watchedBody.length > 150 && "..."}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {watchedBody.length} characters
                    </div>
                  </div>
                </>
              )}
              {!isFormValid() && (
                <>
                  <Separator />
                  <div className="text-xs text-orange-600">
                    <strong>Missing:</strong>
                    <ul className="mt-1 space-y-1">
                      {watchedRecipients.length === 0 && <li>• Recipients</li>}
                      {!watchedSubject && <li>• Subject</li>}
                      {!watchedBody && <li>• Message body</li>}
                      {!watchedScheduleAt && <li>• Schedule time</li>}
                      {watchedScheduleType === "quick" &&
                        !watchedQuickOption && <li>• Quick schedule option</li>}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
