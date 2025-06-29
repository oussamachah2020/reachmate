"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Paperclip,
  FileText,
  Send,
  PlusIcon,
  XIcon,
  Users,
  User,
  LoaderCircle,
  Mail,
  Tag,
  FolderOpen,
  Reply,
  AtSign,
  MessageSquare,
  Trash2,
} from "lucide-react";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { TemplatePickerDialog } from "./template-picker-dialog";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { ReceiverEmailSelect } from "./receiver-email-creatble-select";
import AttachmentsDialog from "./attachments-dialog";
import type { Attachment } from "@/types/inbox";
import { updateStorageUsage } from "@/functions/storage-tracker";

// Define Zod schema for form validation
const emailSchema = z.string().email("Invalid email address").trim();
const multipleEmailSchema = z.string().refine(
  (value) => {
    if (!value) return false;
    const emails = value.split(";").map((email) => email.trim());
    return emails.every((email) => emailSchema.safeParse(email).success);
  },
  { message: "All email addresses must be valid" }
);

const formSchema = z
  .object({
    to: z.string().optional(),
    toMultiple: z.string().optional(),
    subject: z.string().min(1, "Subject is required"),
    cc: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    tagId: z.string().optional(),
    replyTo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.to || data.toMultiple) return true;
      return false;
    },
    { message: "At least one recipient is required", path: ["to"] }
  );

type FormValues = z.infer<typeof formSchema>;

type EmailOption = {
  value: string;
  label: string;
};

const EmailSendingDialog = () => {
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: "",
    content: "",
    isDefault: false,
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const [tags, setTags] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const [recipientError, setRecipientError] = useState("");
  const [recipientMode, setRecipientMode] = useState<"single" | "multiple">(
    "single"
  );
  const [toEmail, setToEmail] = useState<EmailOption | null>(null);
  const [ccEmail, setCcEmail] = useState<EmailOption | null>(null);
  const [multipleRecipients, setMultipleRecipients] = useState<string[]>([]);
  const [multipleCcRecipients, setMultipleCcRecipients] = useState<string[]>(
    []
  );
  const [currentToInput, setCurrentToInput] = useState("");
  const [currentCcInput, setCurrentCcInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, sender, usage, plan } = useAuthStore();

  const hitLimit = usage?.resendRequests === plan?.maxAiRequests;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
      toMultiple: "",
      subject: "",
      cc: "",
      categoryId: "",
      tagId: "",
      replyTo: user?.email,
    },
  });

  useEffect(() => {
    if (recipientMode === "single") {
      setValue("to", toEmail?.value || "");
      setValue("toMultiple", "");
    } else {
      setValue("toMultiple", multipleRecipients.join(";"));
      setValue("to", "");
    }
  }, [toEmail, multipleRecipients, recipientMode, setValue]);

  useEffect(() => {
    if (recipientMode === "single") {
      setValue("cc", ccEmail?.value || "");
    } else {
      setValue("cc", multipleCcRecipients.join(";"));
    }
  }, [ccEmail, multipleCcRecipients, recipientMode, setValue]);

  useEffect(() => {
    if (!selectedTemplate.id) {
      setContent("");
    }
  }, [selectedTemplate]);

  const validateEmail = (email: string): boolean => {
    return emailSchema.safeParse(email).success;
  };

  const addToRecipient = (email: string) => {
    const trimmedEmail = email.trim();
    if (
      trimmedEmail &&
      validateEmail(trimmedEmail) &&
      !multipleRecipients.includes(trimmedEmail)
    ) {
      setMultipleRecipients([...multipleRecipients, trimmedEmail]);
      setCurrentToInput("");
      setRecipientError("");
    } else if (multipleRecipients.includes(trimmedEmail)) {
      toast.error("Email already added");
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  const removeToRecipient = (emailToRemove: string) => {
    setMultipleRecipients(
      multipleRecipients.filter((email) => email !== emailToRemove)
    );
  };

  const addCcRecipient = (email: string) => {
    const trimmedEmail = email.trim();
    if (
      trimmedEmail &&
      validateEmail(trimmedEmail) &&
      !multipleCcRecipients.includes(trimmedEmail)
    ) {
      setMultipleCcRecipients([...multipleCcRecipients, trimmedEmail]);
      setCurrentCcInput("");
    } else if (multipleCcRecipients.includes(trimmedEmail)) {
      toast.error("Email already added to CC");
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  const removeCcRecipient = (emailToRemove: string) => {
    setMultipleCcRecipients(
      multipleCcRecipients.filter((email) => email !== emailToRemove)
    );
  };

  const handleToKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addToRecipient(currentToInput);
    }
  };

  const handleCcKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCcRecipient(currentCcInput);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const senderId = user?.id;
      if (!senderId) {
        toast.error("User not authenticated.");
        return;
      }

      let recipients: string[] = [];
      let ccRecipients: string[] = [];

      if (recipientMode === "single") {
        if (!data.to) {
          toast.error("Please select a recipient.");
          return;
        }
        recipients = [data.to];
        if (data.cc) {
          ccRecipients = [data.cc];
        }
      } else {
        if (multipleRecipients.length === 0) {
          setRecipientError("At least one recipient is required");
          toast.error("Please add at least one recipient.");
          return;
        }
        recipients = multipleRecipients;
        ccRecipients = multipleCcRecipients;
      }

      const receiverIds: string[] = [];
      for (const recipient of recipients) {
        let receiverId: string;

        const { data: existingReceiver } = await supabase
          .from("receiver")
          .select("id")
          .eq("email", recipient)
          .single();

        if (existingReceiver) {
          receiverId = existingReceiver.id;
        } else {
          const { data: newReceiver, error: createError } = await supabase
            .from("receiver")
            .insert({
              firstName: "",
              lastName: "",
              email: recipient,
            })
            .select("id")
            .single();

          if (createError) {
            console.error("Error creating receiver:", createError);
            toast.error(`Failed to save receiver data for ${recipient}.`);
            continue;
          }
          receiverId = newReceiver.id;
        }
        receiverIds.push(receiverId);
      }

      let newTemplateId: string;

      if (!selectedTemplate.id) {
        const { data: createdTemplate, error: newTemplateError } =
          await supabase
            .from("template")
            .insert({
              subject: data.subject,
              description: "",
              body: content,
              replyTo: data.replyTo,
              categoryId: data.categoryId,
              tagId: data.tagId,
              senderId: user?.id,
            })
            .select("id")
            .single();

        if (newTemplateError) {
          throw new Error("Failed to create template");
        }
        newTemplateId = createdTemplate?.id;
      }

      const sendPromises = receiverIds.map(async (receiverId, index) => {
        const recipient = recipients[index];
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName: `${sender?.firstName} ${sender?.lastName}`,
            from: user?.email || sender?.email,
            to: recipient,
            senderId: user?.id,
            replyTo: data.replyTo,
            subject: data.subject,
            html: content,
            cc: ccRecipients.length > 0 ? ccRecipients : undefined,
            attachments,
          }),
        });

        const result = await res.json();
        if (!result.success) {
          throw new Error(`Failed to send email to ${recipient}`);
        }

        const { error: emailError } = await supabase.from("email_sent").insert({
          categoryId: data.categoryId || null,
          tagId: data.tagId || null,
          message: content,
          templateId:
            selectedTemplate.isDefault === false
              ? selectedTemplate.id || newTemplateId
              : null,
          defaultTemplateId: selectedTemplate.isDefault
            ? selectedTemplate.id
            : null,
          senderId: user?.id,
          resend_email_id: result.id,
          receiverId,
          sentAt: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
          opened_at: new Date().toISOString(),
          clicked_at: new Date().toISOString(),
          bounced_at: new Date().toISOString(),
          complained_at: new Date().toISOString(),
        });

        if (emailError) {
          throw new Error(`Failed to save email metadata for ${recipient}`);
        }

        return { success: true, recipient };
      });

      const results = await Promise.allSettled(sendPromises);

      const successfulSends = results.filter(
        (r) => r.status === "fulfilled"
      ).length;
      const failedSends = results.filter((r) => r.status === "rejected");

      if (failedSends.length > 0) {
        console.error("Failed sends:", failedSends);
        toast.error(
          `Failed to send ${failedSends.length} of ${recipients.length} emails.`
        );
      }

      if (successfulSends > 0) {
        toast.success(
          `Email sent successfully to ${successfulSends} recipient(s)!`
        );
      }

      if (recipients.length > 0 && attachments.length > 0) {
        const { data: emailSentData } = await supabase
          .from("email_sent")
          .select("id")
          .eq("receiverId", receiverIds[0])
          .single();

        if (emailSentData) {
          const newAttachmentInserts = attachments
            .filter((file) => !file.id)
            .map((file) => ({
              fileUrl: file.url,
              fileName: file.name,
              fileType: file.mimeType,
              size: atob(file.content).length,
              emailSendId: emailSentData.id,
              userId: user?.id,
            }));

          if (newAttachmentInserts.length > 0) {
            const { error: attachError } = await supabase
              .from("attachment")
              .insert(newAttachmentInserts);

            if (attachError) {
              console.error(attachError);
              toast.error("Failed to save new attachments.");
            }
          }
        }
      }

      reset();
      setToEmail(null);
      setCcEmail(null);
      setMultipleRecipients([]);
      setMultipleCcRecipients([]);
      setCurrentToInput("");
      setCurrentCcInput("");
      setRecipientError("");
      setContent("");
      setSelectedTemplate({ id: "", content: "", isDefault: false });
      setAttachments([]);
      setIsOpen(false);
    } catch (err) {
      console.error("Error sending/saving email:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    const uploaded: Attachment[] = [];

    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("attachments")
        .upload(path, file);

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("attachments").getPublicUrl(path);

      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await updateStorageUsage(user?.id || "", file.size);

      uploaded.push({
        id: "",
        name: file.name,
        fileName: file.name,
        url: publicUrl,
        fileUrl: publicUrl,
        path,
        mimeType: file.type,
        fileType: file.type,
        content: base64Content,
      });
    }

    setAttachments((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleDelete = async (filePath: string) => {
    if (!filePath.startsWith("http")) {
      const { error } = await supabase.storage
        .from("attachments")
        .remove([filePath]);

      if (error) {
        console.error("Delete error:", error);
        return;
      }
    }

    setAttachments((prev) => prev.filter((file) => file.path !== filePath));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("category")
        .select("id, name");
      if (data) {
        setCategories(data.map((c) => ({ ...c, count: 0 })));
      }
    };

    const fetchTags = async () => {
      const { data, error } = await supabase.from("tag").select("id, name");
      if (data) {
        setTags(data.map((t) => ({ ...t, count: 0 })));
      }
    };

    fetchCategories();
    fetchTags();
  }, [user]);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={hitLimit}
            className="bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Compose Email
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-5xl h-[95vh] overflow-auto p-0 border-0 shadow-2xl">
          <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    Compose Email
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Create and send your message
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {recipientMode === "multiple" && multipleRecipients.length > 0
                  ? `${multipleRecipients.length} recipients`
                  : "Draft"}
              </Badge>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {/* Recipient Mode Selector */}
                <Card className="border-0 shadow-sm bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Send to:
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={
                            recipientMode === "single" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setRecipientMode("single");
                            setRecipientError("");
                          }}
                          className="flex items-center gap-2 transition-all"
                        >
                          <User className="h-3 w-3" />
                          Single Recipient
                        </Button>
                        <Button
                          type="button"
                          variant={
                            recipientMode === "multiple" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setRecipientMode("multiple");
                            setRecipientError("");
                          }}
                          className="flex items-center gap-2 transition-all"
                        >
                          <Users className="h-3 w-3" />
                          Multiple Recipients
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recipients Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recipientMode === "single" ? (
                    <>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <AtSign className="h-4 w-4" />
                          To *
                        </Label>
                        <ReceiverEmailSelect
                          value={toEmail}
                          onChange={(option) => {
                            setToEmail(option);
                            setValue("to", option?.value || "");
                          }}
                        />
                        {errors.to && (
                          <span className="text-destructive text-xs">
                            {errors.to.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <AtSign className="h-4 w-4" />
                          CC
                        </Label>
                        <ReceiverEmailSelect
                          placeholder="Add CC recipient"
                          value={ccEmail}
                          onChange={(option) => {
                            setCcEmail(option);
                            setValue("cc", option?.value || "");
                          }}
                        />
                        {errors.cc && (
                          <span className="text-destructive text-xs">
                            {errors.cc.message}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <AtSign className="h-4 w-4" />
                          To Recipients *
                        </Label>
                        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                          <CardContent className="p-3">
                            <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                              {multipleRecipients.map((email, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="flex items-center gap-1 pr-1"
                                >
                                  <span className="text-xs">{email}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeToRecipient(email)}
                                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <XIcon className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                              <Input
                                type="email"
                                value={currentToInput}
                                onChange={(e) =>
                                  setCurrentToInput(e.target.value)
                                }
                                onKeyPress={handleToKeyPress}
                                onBlur={() =>
                                  currentToInput.trim() &&
                                  addToRecipient(currentToInput)
                                }
                                placeholder={
                                  multipleRecipients.length === 0
                                    ? "Type email and press Enter..."
                                    : "Add another email..."
                                }
                                className="border-0 shadow-none focus-visible:ring-0 flex-1 min-w-[200px] text-sm"
                              />
                            </div>
                          </CardContent>
                        </Card>
                        {recipientError && multipleRecipients.length === 0 && (
                          <span className="text-destructive text-xs">
                            {recipientError}
                          </span>
                        )}
                        {errors.toMultiple && (
                          <span className="text-destructive text-xs">
                            {errors.toMultiple.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <AtSign className="h-4 w-4" />
                          CC Recipients
                        </Label>
                        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                          <CardContent className="p-3">
                            <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                              {multipleCcRecipients.map((email, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="flex items-center gap-1 pr-1"
                                >
                                  <span className="text-xs">{email}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCcRecipient(email)}
                                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <XIcon className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                              <Input
                                type="email"
                                value={currentCcInput}
                                onChange={(e) =>
                                  setCurrentCcInput(e.target.value)
                                }
                                onKeyPress={handleCcKeyPress}
                                onBlur={() =>
                                  currentCcInput.trim() &&
                                  addCcRecipient(currentCcInput)
                                }
                                placeholder={
                                  multipleCcRecipients.length === 0
                                    ? "Type CC email and press Enter..."
                                    : "Add another CC email..."
                                }
                                className="border-0 shadow-none focus-visible:ring-0 flex-1 min-w-[200px] text-sm"
                              />
                            </div>
                          </CardContent>
                        </Card>
                        {errors.cc && (
                          <span className="text-destructive text-xs">
                            {errors.cc.message}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Reply To Field */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Reply className="h-4 w-4" />
                    Reply To
                  </Label>
                  <Input
                    placeholder="Reply-to email address"
                    {...register("replyTo")}
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.replyTo && (
                    <span className="text-destructive text-xs">
                      {errors.replyTo.message}
                    </span>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Subject */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Subject *
                  </Label>
                  <Input
                    placeholder="Enter email subject"
                    {...register("subject")}
                    className="text-base transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.subject && (
                    <span className="text-destructive text-xs">
                      {errors.subject.message}
                    </span>
                  )}
                </div>

                {/* Category and Tag */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Category *
                    </Label>
                    <Select
                      onValueChange={(val) => setValue("categoryId", val)}
                    >
                      <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-3 w-3" />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <span className="text-destructive text-xs">
                        {errors.categoryId.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tag
                    </Label>
                    <Select onValueChange={(val) => setValue("tagId", val)}>
                      <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Select a tag" />
                      </SelectTrigger>
                      <SelectContent>
                        {tags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            <div className="flex items-center gap-2">
                              <Tag className="h-3 w-3" />
                              {tag.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tagId && (
                      <span className="text-destructive text-xs">
                        {errors.tagId.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Message Content
                  </Label>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                      <RichTextEditor
                        value={content}
                        htmlContent={selectedTemplate.content}
                        onChange={setContent}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Attachments Display */}
                {attachments.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Attachments ({attachments.length})
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {attachments.map((file, index) => (
                        <Card
                          key={file.path || index}
                          className="group hover:shadow-md transition-all"
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                <a
                                  href={file.url || file.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm hover:underline truncate"
                                  title={file.name || file.fileName}
                                >
                                  {file.name || file.fileName}
                                </a>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(file.path)}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Footer */}
              <div className="border-t bg-card/50 backdrop-blur-sm px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TemplatePickerDialog
                      onSelect={(template) => {
                        setSelectedTemplate({
                          id: template.id,
                          content: template.content,
                          isDefault: template.isDefault,
                        });
                        setContent(template.content);
                      }}
                    />
                    <Separator orientation="vertical" className="h-6" />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Paperclip className="h-4 w-4" />
                      {uploading ? "Uploading..." : "Quick Upload"}
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      hidden
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <AttachmentsDialog
                      selectedAttachments={attachments}
                      onAttachmentsChange={setAttachments}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 min-w-[120px]"
                  >
                    {loading ? (
                      <LoaderCircle className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                        {recipientMode === "multiple" &&
                          multipleRecipients.length > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {multipleRecipients.length}
                            </Badge>
                          )}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailSendingDialog;
