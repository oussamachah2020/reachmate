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
import { ReceiverEmailSelect } from "./receiver-email-creatble-select";
import AttachmentsDialog from "./attachments-dialog";
import { Separator } from "../ui/separator";

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

  const [toEmail, setToEmail] = useState<EmailOption | null>(null);
  const [ccEmail, setCcEmail] = useState<EmailOption | null>(null);

  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>();

  const watchedTo = watch("to");
  const watchedCc = watch("cc");

  useEffect(() => {
    if (toEmail) {
      setValue("to", toEmail.value);
    } else {
      setValue("to", "");
    }
  }, [toEmail, setValue]);

  useEffect(() => {
    if (ccEmail) {
      setValue("cc", ccEmail.value);
    } else {
      setValue("cc", "");
    }
  }, [ccEmail, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      const senderId = user?.id;
      if (!senderId) {
        toast.error("User not authenticated.");
        return;
      }

      if (!data.to) {
        toast.error("Please select a recipient.");
        return;
      }

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

      let receiverData;

      const { data: existingReceiver, error: findError } = await supabase
        .from("receiver")
        .select("*")
        .eq("email", data.to)
        .single();

      if (existingReceiver) {
        receiverData = existingReceiver;
        console.log("Using existing receiver:", existingReceiver.email);
      } else {
        const { data: newReceiver, error: createError } = await supabase
          .from("receiver")
          .insert({
            firstName: "",
            lastName: "",
            email: data.to,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating receiver:", createError);
          toast.error("Failed to save receiver data.");
          return;
        }

        receiverData = newReceiver;
      }

      const { data: emailSentData, error: emailError } = await supabase
        .from("email_sent")
        .insert([
          {
            categoryId: data.categoryId || null,
            tagId: data.tagId || null,
            templateId: selectedTemplate.id,
            senderId: user?.id,
            receiverId: receiverData?.id,
          },
        ])
        .select()
        .single();

      if (emailError) {
        console.error(emailError);
        toast.error("Failed to save email metadata.");
        return;
      }

      // Only insert new attachments, not existing ones
      const newAttachmentInserts = attachments
        .filter((file) => !file.id) // New uploads don't have an id initially
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
          return;
        }
      }

      toast.success("Email sent and saved successfully!");

      // Reset form
      reset();
      setToEmail(null);
      setCcEmail(null);
      setContent("");
      setSelectedTemplate({ id: "", content: "" });
      setAttachments([]);
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

      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      uploaded.push({
        id: "", // New uploads start without ID
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
    // For new uploads, delete from storage
    if (!filePath.startsWith('http')) {
      const { error } = await supabase.storage
        .from("attachments")
        .remove([filePath]);

      if (error) {
        console.error("Delete error:", error);
        return;
      }
    }

    // Remove from state (works for both new uploads and existing files)
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
              className="flex flex-col space-y-3 px-4 py-3"
            >
              <div>
                <ReceiverEmailSelect value={toEmail} onChange={setToEmail} />
                {errors.to && (
                  <span className="text-red-500 text-xs">
                    Recipient is required
                  </span>
                )}
              </div>

              <div>
                <Input
                  id="subject"
                  placeholder="Subject"
                  className="text-sm border-gray-200"
                  {...register("subject", { required: "Subject is required" })}
                />
                {errors.subject && (
                  <span className="text-red-500 text-xs">
                    {errors.subject.message}
                  </span>
                )}
              </div>

              <div>
                <ReceiverEmailSelect
                  placeholder="cc"
                  value={ccEmail}
                  onChange={setCcEmail}
                />
              </div>

              <div className="flex gap-3 w-full">
                <div className="w-full space-y-2">
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

                <div className="w-full space-y-2">
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

              <div className="space-y-3">
                <Label>Message</Label>
                <RichTextEditor
                  value={content}
                  htmlContent={selectedTemplate.content}
                  onChange={setContent}
                />
              </div>

              {/* Attachments Display */}
              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={file.path || index}
                      className="group relative flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-800 border"
                    >
                      <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                      <a
                        href={file.url || file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline max-w-[180px] truncate"
                      >
                        {file.name || file.fileName}
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

              {/* Footer Actions */}
              <div className="flex justify-between items-center pt-2 border-t mt-4">
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
                    {uploading ? "Uploading..." : "Quick Upload"}
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <div className="h-5 bg-gray-400 w-[1px]" />
                  <AttachmentsDialog 
                    selectedAttachments={attachments}
                    onAttachmentsChange={setAttachments}
                  />
                </div>

                <Button type="submit" className="bg-primary text-white">
                  <Send className="h-4 w-4 mr-1" />
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