"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Paperclip, FileText, Send, PlusIcon, XIcon } from "lucide-react";
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

type Attachment = {
  name: string;
  url: string;
  path: string;
  mimeType: string;
  content: string; // base64 encoded
};

type FormValues = {
  to: string;
  subject: string;
  cc?: string;
  categoryId: string;
  tagId: string;
};

const EmailSendingDialog = () => {
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: "",
    content: "",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const [tags, setTags] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      const senderId = user?.id;
      if (!senderId) {
        toast.error("User not authenticated.");
        return;
      }

      // Step 1: Send the email via your backend (optional)
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: data.to,
          subject: data.subject,
          html: content,
          attachments,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        toast.error("Failed to send email.");
        return;
      }

      // Step 2: Insert email metadata in `email_sent`
      const { data: emailSentData, error: emailError } = await supabase
        .from("email_sent")
        .insert([
          {
            categoryId: data.categoryId || null,
            tagId: data.tagId || null,
            templateId: selectedTemplate.id, // ensure you pass templateId somehow
            senderId: user?.id,
            receiverId: result.receiverId, // You must either derive or get this from the result
          },
        ])
        .select()
        .single();

      if (emailError || !emailSentData) {
        console.error(emailError);
        toast.error("Failed to save email metadata.");
        return;
      }

      const emailSentId = emailSentData.id;

      // Step 3: Save attachments to `attachment` table
      const attachmentInserts = attachments.map((file) => ({
        fileUrl: file.url,
        fileName: file.name,
        fileType: file.mimeType,
        size: atob(file.content).length, // rough estimation
        userId: user?.id,
      }));

      if (attachmentInserts.length > 0) {
        const { error: attachError } = await supabase
          .from("attachment")
          .insert(attachmentInserts);

        if (attachError) {
          console.error(attachError);
          toast.error("Failed to save attachments.");
          return;
        }
      }

      toast.success("Email sent and saved successfully!");
      // Optionally: reset form here
    } catch (err) {
      console.error("Error sending/saving email:", err);
      toast.error("Something went wrong.");
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

      // Read and encode the file content
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // remove data:...base64,
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      uploaded.push({
        name: file.name,
        url: publicUrl,
        path,
        mimeType: file.type,
        content: base64Content,
      });
    }

    setAttachments((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleDelete = async (filePath: string) => {
    const { error } = await supabase.storage
      .from("attachments")
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return;
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
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-primary text-white">
            <PlusIcon className="h-5 w-5" />
            Compose
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-4xl p-0 border-none shadow-2xl rounded-lg overflow-hidden">
          <div className="bg-white flex flex-col">
            <DialogTitle>
              <div className="px-4 py-3 border-b text-sm font-medium bg-gray-100">
                New Message
              </div>
            </DialogTitle>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col space-y-2 px-4 py-3"
            >
              <Input
                placeholder="To"
                className="text-sm border-gray-200"
                {...register("to", {
                  required: "Recipient email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Invalid email format",
                  },
                })}
              />
              {errors.to && (
                <span className="text-red-500 text-xs">
                  {errors.to.message}
                </span>
              )}

              <Input
                placeholder="Subject"
                className="text-sm border-gray-200"
                {...register("subject", { required: "Subject is required" })}
              />
              {errors.subject && (
                <span className="text-red-500 text-xs">
                  {errors.subject.message}
                </span>
              )}

              <Input
                placeholder="cc"
                className="text-sm border-gray-200"
                {...register("cc")}
              />

              <div className="flex gap-3 w-full my-1">
                <div className="w-full space-y-3">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select onValueChange={(val) => setValue("categoryId", val)}>
                    <SelectTrigger id="categoryId" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <span className="text-red-500 text-xs">
                      Category is required
                    </span>
                  )}
                </div>

                <div className="w-full space-y-3">
                  <Label htmlFor="tagId">Tag</Label>
                  <Select onValueChange={(val) => setValue("tagId", val)}>
                    <SelectTrigger id="tagId" className="w-full">
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tagId && (
                    <span className="text-red-500 text-xs">
                      Tag is required
                    </span>
                  )}
                </div>
              </div>

              <RichTextEditor
                value={content}
                htmlContent={selectedTemplate.content}
                onChange={setContent}
              />

              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {attachments.map((file) => (
                    <div
                      key={file.path}
                      className="group relative flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-800 border"
                    >
                      <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline max-w-[180px] truncate"
                      >
                        {file.name}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(file.path)}
                        className="absolute top-0 right-0 p-1 hidden group-hover:flex text-gray-500 hover:text-red-600"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <div className="flex items-center space-x-2">
                  <TemplatePickerDialog
                    onSelect={(template) => {
                      setSelectedTemplate({
                        id: template.id,
                        content: template.content,
                      });
                      setContent(template.content);
                    }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex items-center text-muted-foreground hover:text-primary text-sm"
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
                </div>

                <Button type="submit" className="bg-primary text-white">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailSendingDialog;
