"use client";

import { useEffect, useState } from "react";
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

export function TemplatesList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const { viewMode } = useViewModeStore();
  const { user } = useAuthStore();
  const { setSelectedTemplate } = useTemplateStore();
  const [open, setOpen] = useState(false);

  const fetchTemplates = async () => {
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
  };

  const duplicateTemplate = async (template: DuplicationDto) => {
    toast.loading("Duplicating template...", { id: "duplicate" });
    try {
      if (!template.categoryId || !template.tagId) {
        toast.error("Category and tag are required for duplication");
        return;
      }

      const { error } = await supabase.from("template").insert({
        subject: template.subject,
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
      toast.dismiss("duplicate");
    }
  };

  const handleTemplateDelete = async (id: string) => {
    toast.loading("Deleting template...", { id: "delete" });
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
      toast.dismiss("delete");
    }
  };

  function handleEdit(template: Template) {
    setSelectedTemplate(template);
    setOpen(true);
  }

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
          setTemplates((prev) => prev.filter((t) => t.id !== payload.old.id));
          toast.success("Template deleted");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getPlainTextPreview = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (
      doc.body.textContent?.slice(0, 100) +
        (doc.body.textContent && doc.body.textContent.length > 100
          ? "..."
          : "") || ""
    );
  };

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          : "flex flex-col gap-4"
      }
    >
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`group relative overflow-hidden border rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ${
            viewMode === "list" ? "flex h-36" : "flex flex-col"
          }`}
          onMouseEnter={() => setHoveredTemplate(template.id)}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          {/* {viewMode === "list" ? (
            <Card
              key={template.id}
              className={`group relative overflow-hidden border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex h-40 bg-white hover:bg-gray-50`}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="w-1/3 border-r bg-gray-100 p-4 flex items-center justify-center">
                <p className="text-sm text-gray-700 line-clamp-4 font-light italic">
                  {getPlainTextPreview(template.body) || "No preview available"}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <CardContent className="p-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {template.subject}
                      </h3>
                      {template.description && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <div
                      className={`flex items-center gap-2 transition-opacity duration-200 ${
                        hoveredTemplate === template.id
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <PreviewDialog
                        openPreview={openPreview}
                        setOpenPreview={setOpenPreview}
                        children={
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Preview"
                            onClick={() => setOpenPreview(true)}
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                        }
                        content={template.body}
                      />
                      <CreateTemplateDialog
                        open={open}
                        setOpen={setOpen}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Duplicate"
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
                        <Copy className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => handleTemplateDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {template.category && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {template.category.name}
                      </Badge>
                    )}
                    {template.tag && (
                      <Badge
                        variant="outline"
                        className="text-xs font-medium border-green-200 text-green-800"
                      >
                        {template.tag.name}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(template.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </CardFooter>
              </div>
            </Card>
          ) : ( */}
          <>
            <CardContent className="p-0">
              <div className="relative h-48 bg-gray-50 p-6 flex items-center justify-center border-b">
                {hoveredTemplate === template.id && (
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200">
                    <div className="flex gap-2">
                      <PreviewDialog
                        openPreview={openPreview}
                        setOpenPreview={setOpenPreview}
                        children={
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white hover:bg-gray-100"
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
                            className="bg-primary hover:bg-primary-dark"
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
                <p className="text-sm text-gray-600 line-clamp-4 text-center">
                  {getPlainTextPreview(template.body)}
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                    {template.subject}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
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
                        className="text-red-600 cursor-pointer"
                        onClick={() => handleTemplateDelete(template.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {template.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {template.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {template.tag && (
                    <Badge variant="outline" className="text-xs font-medium">
                      {template.tag.name}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {template.category && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">
                      {template.category.name}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(template.createdAt).toLocaleDateString()}
              </span>
            </CardFooter>
          </>
          {/* )} */}
        </Card>
      ))}
    </div>
  );
}
