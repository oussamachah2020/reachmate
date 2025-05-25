import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
  FileText,
  FileImage,
  File,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  FileVideo,
  FileAudio,
  FileType2,
  Upload,
  Check,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AttachmentsDialogProps = {
  selectedAttachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
};

type Attachment = {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  name: string;
  url: string;
  path: string;
  mimeType: string;
  content: string;
};

type ExistingAttachment = {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
};

const getFileIcon = (type: string) => {
  if (type.includes("image")) return <FileImage className="text-blue-500" />;
  if (type.includes("pdf")) return <FileText className="text-red-500" />;
  if (type.includes("spreadsheet"))
    return <FileSpreadsheet className="text-green-500" />;
  if (type.includes("zip") || type.includes("rar"))
    return <FileArchive className="text-yellow-500" />;
  if (type.includes("video")) return <FileVideo className="text-purple-500" />;
  if (type.includes("audio")) return <FileAudio className="text-indigo-500" />;
  if (type.includes("code")) return <FileCode className="text-orange-500" />;
  if (type.includes("word") || type.includes("document"))
    return <FileType2 className="text-sky-500" />;
  return <File className="text-muted-foreground" />;
};

const AttachmentsDialog: React.FC<AttachmentsDialogProps> = ({
  selectedAttachments = [],
  onAttachmentsChange,
}) => {
  const [existingFiles, setExistingFiles] = useState<ExistingAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchFiles() {
      try {
        const { data, error } = await supabase
          .from("attachment")
          .select("id, fileType, fileName, fileUrl")
          .eq("userId", user?.id);

        if (error) {
          toast.error("Error fetching files");
          console.error(error);
          return;
        }

        setExistingFiles(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching files");
      }
    }

    if (user?.id && open) {
      fetchFiles();
    }
  }, [user, open]);

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
        toast.error(`Failed to upload ${file.name}`);
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

      // Save to database
      const { data: attachmentData, error: dbError } = await supabase
        .from("attachment")
        .insert({
          fileUrl: publicUrl,
          fileName: file.name,
          fileType: file.type,
          size: atob(base64Content).length,
          userId: user?.id,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        toast.error(`Failed to save ${file.name} to database`);
        continue;
      }

      uploaded.push({
        id: attachmentData.id,
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

    if (uploaded.length > 0) {
      const newAttachments = [...selectedAttachments, ...uploaded];
      onAttachmentsChange?.(newAttachments);

      // Refresh existing files list
      const { data } = await supabase
        .from("attachment")
        .select("id, fileType, fileName, fileUrl")
        .eq("userId", user?.id);
      setExistingFiles(data || []);

      toast.success(`${uploaded.length} file(s) uploaded successfully!`);
    }

    setUploading(false);
  };

  const handleSelectExistingFile = async (existingFile: ExistingAttachment) => {
    // Check if already selected
    const isAlreadySelected = selectedAttachments.some(
      (att) => att.id === existingFile.id
    );

    if (isAlreadySelected) {
      // Remove from selection
      const filtered = selectedAttachments.filter(
        (att) => att.id !== existingFile.id
      );
      onAttachmentsChange?.(filtered);
      return;
    }

    try {
      // Fetch the file from storage to get base64 content
      const response = await fetch(existingFile.fileUrl);
      const blob = await response.blob();

      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const attachmentForEmail: Attachment = {
        id: existingFile.id,
        name: existingFile.fileName,
        fileName: existingFile.fileName,
        url: existingFile.fileUrl,
        fileUrl: existingFile.fileUrl,
        path: existingFile.fileUrl, // Use URL as path for existing files
        mimeType: existingFile.fileType,
        fileType: existingFile.fileType,
        content: base64Content,
      };

      const newAttachments = [...selectedAttachments, attachmentForEmail];
      onAttachmentsChange?.(newAttachments);
    } catch (error) {
      console.error("Error processing existing file:", error);
      toast.error("Failed to select file");
    }
  };

  const isFileSelected = (fileId: string) => {
    return selectedAttachments.some((att) => att.id === fileId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="hover:underline text-gray-500 p-0">
          Manage Attachments
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Attachments</DialogTitle>
          <DialogDescription>
            Upload new files or select from your existing attachments.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Select Existing</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="mt-4">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {existingFiles.length > 0 ? (
                existingFiles.map((file) => (
                  <Card
                    key={file.id}
                    className={`border rounded-lg shadow-sm cursor-pointer transition-colors ${
                      isFileSelected(file.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => handleSelectExistingFile(file)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6">
                          {getFileIcon(file.fileType)}
                        </div>
                        <p className="text-sm font-medium truncate">
                          {file.fileName}
                        </p>
                      </div>
                      {isFileSelected(file.id) && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <File className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No files found. Upload some files first.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <label
                    htmlFor="file-upload-dialog"
                    className="cursor-pointer"
                  >
                    <div className="text-sm text-muted-foreground mb-2">
                      {uploading ? "Uploading..." : "Click to upload files"}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Plus className="w-4 h-4 mr-2" />
                        Choose Files
                      </span>
                    </Button>
                  </label>
                  <input
                    id="file-upload-dialog"
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    disabled={uploading}
                  />
                </div>
              </div>

              {selectedAttachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Recently Selected:
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedAttachments.slice(-3).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="truncate">{file.fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedAttachments.length} file(s) selected
          </div>
          <DialogClose asChild>
            <Button variant="outline">Done</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentsDialog;
