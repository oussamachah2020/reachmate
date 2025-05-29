"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const scheduleFormSchema = z.object({
  recipients: z
    .array(z.string().email())
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
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const quickScheduleOptions = [
  { value: "15min", label: "In 15 minutes" },
  { value: "1hour", label: "In 1 hour" },
  { value: "tomorrow", label: "Tomorrow 9 AM" },
  { value: "nextweek", label: "Next Monday 9 AM" },
];

export default function ScheduleEmailPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientInput, setRecipientInput] = useState("");
  const router = useRouter();

  const form = useForm<ScheduleFormValues>({
    // resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      recipients: [],
      subject: "",
      body: "",
      scheduleType: "datetime",
      quickOption: "",
      scheduleAt: "",
      priority: "normal",
    },
  });

  const watchedScheduleType = form.watch("scheduleType");
  const watchedRecipients = form.watch("recipients");
  const watchedQuickOption = form.watch("quickOption");

  const addRecipient = () => {
    if (recipientInput && recipientInput.includes("@")) {
      const currentRecipients = form.getValues("recipients");
      if (!currentRecipients.includes(recipientInput)) {
        form.setValue("recipients", [...currentRecipients, recipientInput]);
        setRecipientInput("");
      }
    }
  };

  const removeRecipient = (email: string) => {
    const currentRecipients = form.getValues("recipients");
    form.setValue(
      "recipients",
      currentRecipients.filter((r) => r !== email)
    );
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
    }

    const isoString = scheduleDate.toISOString().slice(0, 16);
    form.setValue("scheduleAt", isoString);
    form.setValue("quickOption", option);
  };

  const onSubmit = async (data: ScheduleFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/schedule-email", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast("Email scheduled successfully", {
          description: `Your email will be sent to ${data.recipients.length} recipient(s) at the scheduled time.`,
        });
        router.push("/scheduled");
      } else {
        throw new Error("Failed to schedule email");
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to schedule email. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto  py-8">
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
          <Card>
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
                        </FormLabel>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter email address"
                              value={recipientInput}
                              onChange={(e) =>
                                setRecipientInput(e.target.value)
                              }
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addRecipient())
                              }
                            />
                            <Button
                              type="button"
                              onClick={addRecipient}
                              size="icon"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {watchedRecipients.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {watchedRecipients.map((email) => (
                                <Badge
                                  key={email}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {email}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
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
                              <SelectItem value="low">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                  Low Priority
                                </div>
                              </SelectItem>
                              <SelectItem value="normal">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                                  Normal Priority
                                </div>
                              </SelectItem>
                              <SelectItem value="high">
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
                            placeholder="Write your email message here..."
                            className="min-h-[200px] resize-none"
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
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Timer className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Schedule Email
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
          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Email Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">
                <strong>To:</strong>{" "}
                {watchedRecipients.length > 0
                  ? `${watchedRecipients.length} recipient(s)`
                  : "No recipients"}
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Subject:</strong>{" "}
                {form.watch("subject") || "No subject"}
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Priority:</strong>
                <Badge variant="outline" className="ml-1 text-xs">
                  {form.watch("priority")}
                </Badge>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <strong>Scheduled for:</strong>
                <br />
                {form.watch("scheduleAt")
                  ? new Date(form.watch("scheduleAt")).toLocaleString()
                  : "Not scheduled"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
