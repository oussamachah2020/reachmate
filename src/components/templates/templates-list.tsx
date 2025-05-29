"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Eye,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useViewModeStore } from "@/zustand/global.store";
import { useAuthStore } from "@/zustand/auth.store";
import { supabase } from "@/lib/supabase/client";
import PreviewDialog from "./preview-dialog";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";
import { DuplicationDto, Template } from "@/types/template";
import { useTemplateStore } from "@/zustand/template.store";
import { CreateTemplateDialog } from "./create-template-dialog";

interface TemplatesListProps {
  searchQuery: string;
  sortBy: string;
  onFilteredCountChange: (count: number) => void;
}

export function TemplatesList({
  searchQuery,
  sortBy,
  onFilteredCountChange,
}: TemplatesListProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const { viewMode } = useViewModeStore();
  const { user } = useAuthStore();
  const { setSelectedTemplate } = useTemplateStore();
  const [open, setOpen] = useState(false);

  // Helper function to extract plain text from HTML
  const getPlainTextPreview = useCallback((html: string): string => {
    if (!html) return "";

    try {
      // Create a temporary div element to parse HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const text = tempDiv.textContent || tempDiv.innerText || "";
      return text.length > 150 ? text.slice(0, 150) + "..." : text;
    } catch (error) {
      // Fallback: Simple regex-based HTML tag removal
      const cleaned = html
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return cleaned.length > 150 ? cleaned.slice(0, 150) + "..." : cleaned;
    }
  }, []);

  // Helper function to highlight search terms
  const highlightSearchTerm = useCallback(
    (text: string, searchTerm: string): string => {
      if (!searchTerm.trim()) return text;

      try {
        const regex = new RegExp(
          `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
          "gi"
        );
        return text.replace(
          regex,
          '<mark class="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-1 rounded">$1</mark>'
        );
      } catch (error) {
        return text;
      }
    },
    []
  );

  const fetchTemplates = useCallback(async () => {
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
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    }
  }, []);

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = templates.filter((template) => {
        try {
          const plainTextBody = getPlainTextPreview(template.body);
          return (
            template.subject.toLowerCase().includes(query) ||
            template.description?.toLowerCase().includes(query) ||
            plainTextBody.toLowerCase().includes(query) ||
            template.category?.name.toLowerCase().includes(query) ||
            template.tag?.name.toLowerCase().includes(query)
          );
        } catch (error) {
          console.warn("Error filtering template:", error);
          return false;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      try {
        switch (sortBy) {
          case "recent":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "updated":
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          case "name-asc":
            return a.subject.localeCompare(b.subject);
          case "name-desc":
            return b.subject.localeCompare(a.subject);
          case "oldest":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          default:
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
      } catch (error) {
        console.warn("Error sorting templates:", error);
        return 0;
      }
    });

    return sorted;
  }, [templates, searchQuery, sortBy, getPlainTextPreview]);

  // Update filtered count when it changes
  useEffect(() => {
    onFilteredCountChange(filteredAndSortedTemplates.length);
  }, [filteredAndSortedTemplates.length, onFilteredCountChange]);

  const duplicateTemplate = useCallback(
    async (template: DuplicationDto) => {
      const toastId = "duplicate";
      toast.loading("Duplicating template...", { id: toastId });

      try {
        if (!template.categoryId || !template.tagId) {
          toast.error("Category and tag are required for duplication");
          return;
        }

        const { error } = await supabase.from("template").insert({
          subject: `${template.subject} (Copy)`,
          description: template.description,
          body: template.body,
          categoryId: template.categoryId,
          tagId: template.tagId,
          senderId: user?.id,
        });

        if (error) {
          throw new Error(error.message);
        }

        toast.success("Template duplicated successfully");
      } catch (error) {
        console.error("Error duplicating template:", error);
        toast.error("Failed to duplicate template");
      } finally {
        toast.dismiss(toastId);
      }
    },
    [user?.id]
  );

  const handleTemplateDelete = useCallback(async (id: string) => {
    const toastId = "delete";
    toast.loading("Deleting template...", { id: toastId });

    try {
      if (!id) {
        toast.error("Template ID is missing");
        return;
      }

      const { error } = await supabase.from("template").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Template deleted successfully");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    } finally {
      toast.dismiss(toastId);
    }
  }, []);

  const handleEdit = useCallback(
    (template: Template) => {
      setSelectedTemplate(template);
      setOpen(true);
    },
    [setSelectedTemplate]
  );

  useEffect(() => {
    fetchTemplates();

    const channel: RealtimeChannel = supabase
      .channel("template_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "template",
        },
        async (payload) => {
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
              .eq("id", payload.new.id)
              .single();

            if (error) {
              console.error("Error fetching new template:", error);
              return;
            }

            setTemplates((prev) => [data as unknown as Template, ...prev]);
            toast.success("New template added");
          } catch (error) {
            console.error("Error handling template insert:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "template",
        },
        async (payload) => {
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
              .eq("id", payload.new.id)
              .single();

            if (error) {
              console.error("Error fetching updated template:", error);
              return;
            }

            setTemplates((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? (data as unknown as Template) : t
              )
            );
            toast.success("Template updated");
          } catch (error) {
            console.error("Error handling template update:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "template",
        },
        (payload) => {
          try {
            setTemplates((prev) => prev.filter((t) => t.id !== payload.old.id));
            toast.success("Template deleted");
          } catch (error) {
            console.error("Error handling template delete:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Show empty state when no templates match search
  if (filteredAndSortedTemplates.length === 0 && searchQuery.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No templates found
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          No templates match your search for "{searchQuery}". Try adjusting your
          search terms or create a new template.
        </p>
      </div>
    );
  }

  // Show empty state when no templates exist
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No templates yet
        </h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first email template.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          : "flex flex-col gap-4"
      }
    >
      {filteredAndSortedTemplates.map((template) => (
        <Card
          key={template.id}
          className={`group relative overflow-hidden border rounded-lg shadow-sm hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 ${
            viewMode === "list" ? "flex h-36" : "flex flex-col"
          } ${searchQuery.trim() ? "ring-1 ring-green-200 dark:ring-green-800" : ""}`}
          onMouseEnter={() => setHoveredTemplate(template.id)}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <CardContent className="p-0">
            <div className="relative h-48 p-6 flex items-center justify-center border-b border-border">
              {hoveredTemplate === template.id && (
                <div className="absolute inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200">
                  <div className="flex gap-2">
                    <PreviewDialog
                      openPreview={openPreview}
                      setOpenPreview={setOpenPreview}
                      children={
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-background hover:bg-accent text-foreground"
                          onClick={() => setOpenPreview(true)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Preview
                        </Button>
                      }
                      content={template.body}
                    />
                    <CreateTemplateDialog
                      open={open}
                      setOpen={setOpen}
                      trigger={
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}
              <p
                className="text-sm text-muted-foreground line-clamp-4 text-center"
                dangerouslySetInnerHTML={{
                  __html: highlightSearchTerm(
                    getPlainTextPreview(template.body),
                    searchQuery
                  ),
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-lg font-medium text-foreground line-clamp-1"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(template.subject, searchQuery),
                  }}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <PreviewDialog
                      openPreview={openPreview}
                      setOpenPreview={setOpenPreview}
                      children={
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setOpenPreview(true)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                      }
                      content={template.body}
                    />
                    <CreateTemplateDialog
                      open={open}
                      setOpen={setOpen}
                      trigger={
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        duplicateTemplate({
                          subject: template.subject,
                          body: template.body,
                          categoryId: template.category?.id || "",
                          tagId: template.tag?.id || "",
                          description: template.description || "",
                        })
                      }
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer focus:text-destructive"
                      onClick={() => handleTemplateDelete(template.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {template.description && (
                <p
                  className="text-sm text-muted-foreground line-clamp-2 mb-3"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(
                      template.description,
                      searchQuery
                    ),
                  }}
                />
              )}
              <div className="flex flex-wrap gap-2">
                {template.tag && (
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${
                      template.tag.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                        ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                        : ""
                    }`}
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightSearchTerm(
                          template.tag.name,
                          searchQuery
                        ),
                      }}
                    />
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {template.category && (
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={`text-xs font-medium ${
                      template.category.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchTerm(
                        template.category.name,
                        searchQuery
                      ),
                    }}
                  />
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(template.createdAt).toLocaleDateString()}
            </span>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
