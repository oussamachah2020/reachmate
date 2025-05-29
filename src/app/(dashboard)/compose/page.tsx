"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ArrowLeft, Paperclip, Loader2, FileText, X } from "lucide-react";
import RichTextEditor from "@/components/ui/rich-text-editor";

import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";
import { ReceiverEmailSelect } from "@/components/inbox/receiver-email-creatble-select";
import { TemplatePickerDialog } from "@/components/inbox/template-picker-dialog";
import AttachmentsDialog from "@/components/inbox/attachments-dialog";

type Attachment = {
  id: string;
  name: string;
  fileName: string;
  url: string;
  fileUrl: string;
  path: string;
  mimeType: string;
  fileType: string;
  content: string;
};

type FormValues = {
  to: string;
  subject: string;
  cc?: string;
  categoryId: string;
  tagId: string;
};

type EmailOption = {
  value: string;
  label: string;
};

export default function ComposeEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>();

  // Core state
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: "",
    content: "",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Email recipients
  const [toEmail, setToEmail] = useState<EmailOption | null>(null);
  const [ccEmail, setCcEmail] = useState<EmailOption | null>(null);

  // Data
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);

  const watchedTo = watch("to");
  const watchedCc = watch("cc");
  const watchedSubject = watch("subject");

  // Handle email option changes
  useEffect(() => {
    if (toEmail) setValue("to", toEmail.value);
    else setValue("to", "");
  }, [toEmail, setValue]);

  useEffect(() => {
    if (ccEmail) setValue("cc", ccEmail.value);
    else setValue("cc", "");
  }, [ccEmail, setValue]);

  // Load initial data
  useEffect(() => {
    loadData();
    handleUrlParams();
  }, [searchParams]);

  const loadData = async () => {
    // Load categories and tags
    const [categoriesRes, tagsRes] = await Promise.all([
      supabase.from("category").select("id, name").order("name"),
      supabase.from("tag").select("id, name").order("name"),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (tagsRes.data) setTags(tagsRes.data);
  };

  const handleUrlParams = () => {
    const toParam = searchParams.get("to");
    const subjectParam = searchParams.get("subject");

    if (toParam) setToEmail({ value: toParam, label: toParam });
    if (subjectParam) setValue("subject", subjectParam);
  };

  // File upload
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
      const base64Content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });

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

  const handleDeleteAttachment = async (filePath: string) => {
    if (!filePath.startsWith("http")) {
      await supabase.storage.from("attachments").remove([filePath]);
    }
    setAttachments((prev) => prev.filter((file) => file.path !== filePath));
  };

  // Send email
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSending(true);

      if (!user?.id || !data.to || !data.subject.trim()) {
        toast.error("Please fill in all required fields.");
        return;
      }

      let newTemplateId;

      if (!selectedTemplate.id) {
        const { data: newTemplate, error } = await supabase
          .from("template")
          .insert({
            subject: data.subject,
            description: null,
            body: content,
            categoryId: data.categoryId,
            tagId: data.tagId,
            senderId: user?.id,
          })
          .select("id")
          .single();

        if (error) {
          toast.error("Failed to insert the new template");
          return;
        }

        newTemplateId = newTemplate.id;
      }

      // Send email
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: data.to,
          subject: data.subject,
          html: content,
          cc: data.cc,
          attachments,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        toast.error("Failed to send email.");
        return;
      }

      // Handle receiver
      let receiverData;
      const { data: existingReceiver } = await supabase
        .from("receiver")
        .select("*")
        .eq("email", data.to)
        .single();

      if (existingReceiver) {
        receiverData = existingReceiver;
      } else {
        const { data: newReceiver, error } = await supabase
          .from("receiver")
          .insert({ firstName: "", lastName: "", email: data.to })
          .select()
          .single();
        if (error) throw error;
        receiverData = newReceiver;
      }

      // Save email metadata
      const { data: emailSentData, error } = await supabase
        .from("email_sent")
        .insert({
          categoryId: data.categoryId || null,
          tagId: data.tagId || null,
          templateId: selectedTemplate.id || newTemplateId,
          senderId: user.id,
          receiverId: receiverData.id,
        })
        .select()
        .single();

      console.log(newTemplateId);

      if (error) throw error;

      // Save attachments
      if (attachments.length > 0) {
        const attachmentInserts = attachments
          .filter((file) => !file.id)
          .map((file) => ({
            fileUrl: file.url,
            fileName: file.name,
            fileType: file.mimeType,
            size: atob(file.content).length,
            emailSendId: emailSentData.id,
            userId: user.id,
          }));

        if (attachmentInserts.length > 0) {
          await supabase.from("attachment").insert(attachmentInserts);
        }
      }

      toast.success("Email sent successfully!");

      // Reset and redirect
      reset();
      setToEmail(null);
      setCcEmail(null);
      setContent("");
      setSelectedTemplate({ id: "", content: "" });
      setAttachments([]);
      router.push("/history");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to send email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto p-6">
        {/* Simple Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold ml-4">Compose Email</h1>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>New Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* To */}
              <div className="space-y-2">
                <Label>To</Label>
                <ReceiverEmailSelect value={toEmail} onChange={setToEmail} />
                {errors.to && (
                  <span className="text-red-500 text-xs">
                    Recipient is required
                  </span>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Enter subject..."
                  {...register("subject", { required: "Subject is required" })}
                />
                {errors.subject && (
                  <span className="text-red-500 text-xs">
                    {errors.subject.message}
                  </span>
                )}
              </div>

              {/* CC */}
              <div className="space-y-2">
                <Label>CC (Optional)</Label>
                <ReceiverEmailSelect
                  placeholder="CC recipients..."
                  value={ccEmail}
                  onChange={setCcEmail}
                />
              </div>

              {/* Category & Tag */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label>Category</Label>
                  <Select onValueChange={(val) => setValue("categoryId", val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-full">
                  <Label>Tag</Label>
                  <Select onValueChange={(val) => setValue("tagId", val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2 w-full">
                <Label>Message</Label>
                <RichTextEditor
                  value={content}
                  htmlContent={selectedTemplate.content}
                  onChange={setContent}
                />
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={file.path || index}
                      className="group relative flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm border"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="max-w-[180px] truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttachment(file.path)}
                        className="ml-2 opacity-0 group-hover:opacity-100 text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <TemplatePickerDialog
                    onSelect={(template: any) => {
                      setSelectedTemplate({
                        id: template.id,
                        content: template.content,
                      });
                      setContent(template.content);
                      setValue("subject", template.subject || "");
                    }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex items-center text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Paperclip className="h-4 w-4 mr-1" />
                    {uploading ? "Uploading..." : "Attach"}
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
                  disabled={isSending || !watchedTo || !watchedSubject?.trim()}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
