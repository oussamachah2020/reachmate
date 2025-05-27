"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Template } from "@/types/template";
import { useAuthStore } from "@/zustand/auth.store";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { FileTextIcon, LoaderCircle } from "lucide-react";

type Props = {
  onSelect: (template: { id: string; content: string }) => void;
};

export const TemplatePickerDialog = ({ onSelect }: Props) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [templates, setTemplates] = useState<Template[]>([]);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("template")
          .select(
            `
                  id,
                  subject,
                  body,
                  description,
                  createdAt,
                  updatedAt,
                  tag ( id, name ),
                  category ( id, name )
                `
          )
          .order("createdAt", { ascending: false });

        if (error) {
          console.error("Error fetching templates:", error);
          toast.error("Failed to load templates");
          return;
        }

        setTemplates(data as unknown as Template[]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [user]);

  function handleClose(template: Template) {
    onSelect({ id: template.id, content: template.body });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <Button
        type="button"
        variant="ghost"
        className="text-muted-foreground hover:text-primary"
        onClick={() => setOpen(true)}
      >
        <FileTextIcon className="h-5 w-5" />
        Import Template
      </Button>

      <DialogContent className="max-w-7xl">
        <DialogTitle>
          <div className="px-4 py-3 border-b text-sm font-medium bg-gray-100">
            Select a template
          </div>
        </DialogTitle>
        {loading ? (
          <div className="flex justify-center items-center">
            <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Template List */}
            <div className="w-1/3 space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`cursor-pointer border p-3 rounded-md ${
                    selectedTemplate?.id === template.id
                      ? "border-primary bg-primary/10"
                      : "hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-sm">{template.subject}</p>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="w-2/3">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                Preview
              </h3>
              <div className="border rounded-md p-4 bg-muted min-h-[200px] overflow-y-auto">
                {selectedTemplate ? (
                  <div
                    className="prose text-sm template-content"
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Select a template to preview
                  </p>
                )}
              </div>

              {selectedTemplate && (
                <div className="mt-4 text-right">
                  <Button
                    onClick={() => {
                      handleClose(selectedTemplate);
                    }}
                    className="bg-primary text-white"
                  >
                    Use this Template
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
