"use client";

import React, { useState } from "react";
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

type Attachment = {
  name: string;
  url: string;
  path: string; // needed to delete
};

const EmailSendingDialog = () => {
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

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

      uploaded.push({ name: file.name, url: publicUrl, path });
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

            <form className="flex flex-col space-y-2 px-4 py-3">
              <Input
                type="text"
                placeholder="To"
                className="text-sm border border-gray-200 shadow-none"
              />
              <Input
                type="text"
                placeholder="Subject"
                className="text-sm border border-gray-200 shadow-none"
              />
              <Input
                type="text"
                placeholder="cc"
                className="text-sm border border-gray-200 shadow-none"
              />

              <RichTextEditor
                value={content}
                htmlContent={selectedTemplate}
                onChange={setContent}
              />

              {/* Attachments Preview */}
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

              {/* Toolbar */}
              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <div className="flex items-center space-x-2">
                  <TemplatePickerDialog
                    onSelect={(templateContent) => {
                      setSelectedTemplate(templateContent);
                      setContent(templateContent);
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

                <Button
                  type="submit"
                  className="flex items-center gap-1 bg-primary text-white"
                >
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
