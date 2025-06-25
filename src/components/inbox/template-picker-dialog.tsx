"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Template } from "@/types/template";
import { useAuthStore } from "@/zustand/auth.store";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  FileTextIcon,
  LoaderCircle,
  Search,
  Calendar,
  Tag,
  FolderOpen,
  Eye,
  CheckCircle,
  Sparkles,
} from "lucide-react";

type Props = {
  onSelect: (template: {
    id: string;
    content: string;
    isDefault: boolean;
  }) => void;
};

export const TemplatePickerDialog = ({ onSelect }: Props) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

        const { data: defaultTemplate, error: defaultTemplateError } =
          await supabase
            .from("default_template")
            .select(
              `
          id,
          subject,
          body,
          isDefault,
          description,
          createdAt,
          updatedAt,
          category ( id, name )
        `
            )
            .order("createdAt", { ascending: false });

        if (error || defaultTemplateError) {
          console.error(
            "Error fetching templates:",
            error || defaultTemplateError
          );
          toast.error("Failed to load templates");
          return;
        }

        const mergedTemplates = [...defaultTemplate, ...data];
        setTemplates(mergedTemplates as unknown as Template[]);
        setFilteredTemplates(mergedTemplates as unknown as Template[]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };
    if (open) {
      fetchTemplates();
    }
  }, [user, open]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTemplates(templates);
    } else {
      const filtered = templates.filter(
        (template) =>
          template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          template.category?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          template.tag?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTemplates(filtered);
    }
  }, [searchQuery, templates]);

  function handleClose(template: Template) {
    onSelect({
      id: template.id,
      content: template.body,
      isDefault: template.isDefault || false,
    });
    setOpen(false);
    setSelectedTemplate(null);
    setSearchQuery("");
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        className="text-muted-foreground hover:text-primary transition-colors"
        onClick={() => setOpen(true)}
      >
        <FileTextIcon className="h-4 w-4 mr-2" />
        Import Template
      </Button>

      <DialogContent className="sm:max-w-6xl h-[85vh] overflow-auto p-0 border-0 shadow-2xl">
        <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Choose Template
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Select from {templates.length} available templates
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredTemplates.length} templates
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b bg-card/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, description, category, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Loading templates...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex gap-6 p-6 overflow-hidden">
              {/* Template List */}
              <div className="w-2/5 space-y-3 overflow-y-auto pr-2">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileTextIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? "No templates match your search"
                        : "No templates available"}
                    </p>
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedTemplate?.id === template.id
                          ? "ring-2 ring-primary bg-primary/5 border-primary/20"
                          : "hover:border-primary/30"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {template.subject}
                              </h4>
                              {template.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {template.description}
                                </p>
                              )}
                            </div>
                            {template.isDefault && (
                              <Badge
                                variant="secondary"
                                className="text-xs ml-2 shrink-0"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              {template.category && (
                                <div className="flex items-center gap-1">
                                  <FolderOpen className="h-3 w-3" />
                                  <span>{template.category.name}</span>
                                </div>
                              )}
                              {template.tag && (
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  <span>{template.tag.name}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(template.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <Separator orientation="vertical" className="h-full" />

              {/* Preview */}
              <div className="w-3/5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm">Template Preview</h3>
                  </div>
                  {selectedTemplate && (
                    <Button
                      onClick={() => handleClose(selectedTemplate)}
                      className="bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Use This Template
                    </Button>
                  )}
                </div>

                <Card className="flex-1 border-2 border-dashed border-muted-foreground/25">
                  <CardContent className="p-0 h-full">
                    {selectedTemplate ? (
                      <div className="h-full flex flex-col">
                        {/* Template Header Info */}
                        <div className="p-4 border-b bg-muted/30">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">
                                {selectedTemplate.subject}
                              </h4>
                              {selectedTemplate.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Default Template
                                </Badge>
                              )}
                            </div>
                            {selectedTemplate.description && (
                              <p className="text-sm text-muted-foreground">
                                {selectedTemplate.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {selectedTemplate.category && (
                                <div className="flex items-center gap-1">
                                  <FolderOpen className="h-3 w-3" />
                                  <span>{selectedTemplate.category.name}</span>
                                </div>
                              )}
                              {selectedTemplate.tag && (
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  <span>{selectedTemplate.tag.name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {formatDate(selectedTemplate.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Template Content */}
                        <div className="flex-1 p-4 overflow-y-auto ">
                          <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: selectedTemplate.body,
                            }}
                            style={{
                              fontFamily:
                                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              lineHeight: "1.6",
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-8">
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto">
                            <Eye className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Select a template to preview
                            </p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                              Choose from the list to see the template content
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
