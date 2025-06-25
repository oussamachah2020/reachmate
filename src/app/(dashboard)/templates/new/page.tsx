"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Save,
  Type,
  ImageIcon,
  Link,
  Video,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  Settings,
  Layout,
  FileText,
  Plus,
  Grid3X3,
  Monitor,
  Smartphone,
  Tablet,
  Info,
  FolderOpen,
  AlignLeft,
  MousePointer,
  Layers,
} from "lucide-react";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useTemplateStore } from "@/zustand/template.store";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/rich-text-editor";

type FormValues = {
  templateName: string;
  categoryId: string;
  tagId: string;
  description: string;
  content: string;
};

type Category = {
  id: string;
  name: string;
  count: number;
};

type Tag = {
  id: string;
  name: string;
  count: number;
};

type EmailBlock = {
  id: string;
  type: "text" | "image" | "link" | "video" | "spacer";
  content: any;
  styles: {
    textAlign?: "left" | "center" | "right";
    fontSize?: string;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
    textDecoration?: "none" | "underline";
    color?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
  };
};

const blockTypes = [
  { type: "text", icon: Type, label: "Text", description: "Add text content" },
  {
    type: "image",
    icon: ImageIcon,
    label: "Image",
    description: "Insert image",
  },
  { type: "link", icon: Link, label: "Link", description: "Add hyperlink" },
  { type: "video", icon: Video, label: "Video", description: "Embed video" },
  { type: "spacer", icon: Layout, label: "Spacer", description: "Add spacing" },
];

export default function CreateTemplatePage() {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [emailBlocks, setEmailBlocks] = useState<EmailBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const router = useRouter();

  const { user } = useAuthStore();
  const { selectedTemplate } = useTemplateStore();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      templateName: "",
      categoryId: "",
      tagId: "",
      description: "",
      content: "",
    },
  });

  // Generate HTML from email blocks
  const generateEmailHTML = () => {
    const html = emailBlocks
      .map((block) => {
        const styles = {
          textAlign: block.styles.textAlign || "left",
          fontSize: block.styles.fontSize || "16px",
          fontWeight: block.styles.fontWeight || "normal",
          fontStyle: block.styles.fontStyle || "normal",
          textDecoration: block.styles.textDecoration || "none",
          color: block.styles.color,
          backgroundColor: block.styles.backgroundColor || "transparent",
          padding: block.styles.padding || "10px",
          margin: block.styles.margin || "0",
        };

        const styleStr = Object.entries(styles)
          .map(
            ([key, value]) =>
              `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`
          )
          .join("; ");

        switch (block.type) {
          case "text":
            return `<div style="${styleStr}">${block.content.html || "<p>Enter text here...</p>"}</div>`;
          case "image":
            return `<div style="${styleStr}"><img src="${block.content.src || "/placeholder.svg?height=200&width=400"}" alt="${block.content.alt || ""}" style="max-width: 100%; margin: auto; height: auto;" /></div>`;
          case "link":
            return `<div style="${styleStr}"><a href="${block.content.url || "#"}" style="color: inherit; text-decoration: inherit;">${block.content.text || "Link"}</a></div>`;
          case "video":
            return `<div style="${styleStr}"><a href="${block.content.url || "#"}" style="color: inherit;">📹 ${block.content.title || "Video Link"}</a></div>`;
          case "spacer":
            return `<div style="height: ${block.content.height || "20px"};"></div>`;
          default:
            return "";
        }
      })
      .join("\n");

    setValue("content", html);
    return html;
  };

  // Update content when blocks change
  useEffect(() => {
    generateEmailHTML();
  }, [emailBlocks, setValue]);

  const addBlock = (type: EmailBlock["type"]) => {
    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: {
        textAlign: "left",
        fontSize: "16px",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        backgroundColor: "transparent",
        padding: "16px 0",
        margin: "0 0 16px 0",
      },
    };
    setEmailBlocks([...emailBlocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const getDefaultContent = (type: EmailBlock["type"]) => {
    switch (type) {
      case "text":
        return { html: "<p>Enter your text here...</p>" };
      case "image":
        return { src: "", alt: "Image description" };
      case "link":
        return { text: "Link text", url: "https://example.com" };
      case "video":
        return { title: "Video title", url: "https://youtube.com/watch?v=" };
      case "spacer":
        return { height: "20px" };
      default:
        return {};
    }
  };

  const updateBlock = (blockId: string, updates: Partial<EmailBlock>) => {
    setEmailBlocks((blocks) =>
      blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (blockId: string) => {
    setEmailBlocks((blocks) => blocks.filter((block) => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const currentIndex = emailBlocks.findIndex((block) => block.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= emailBlocks.length) return;

    const newBlocks = [...emailBlocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [
      newBlocks[newIndex],
      newBlocks[currentIndex],
    ];
    setEmailBlocks(newBlocks);
  };

  const selectedBlock = emailBlocks.find(
    (block) => block.id === selectedBlockId
  );

  const onSubmit = async (data: FormValues) => {
    try {
      if (!selectedTemplate) {
        const { error } = await supabase.from("template").insert({
          subject: data.templateName,
          description: data.description,
          body: data.content,
          categoryId: data.categoryId,
          tagId: data.tagId || null,
          senderId: user?.id,
        });

        if (error) {
          toast.error("Error creating template, try again later");
          console.error(error);
          return;
        }

        toast.success("Template created successfully");
        router.push("/templates");
      } else {
        const { error } = await supabase
          .from("template")
          .update({
            subject: data.templateName,
            description: data.description,
            body: data.content,
            categoryId: data.categoryId,
            tagId: data.tagId || null,
            senderId: user?.id,
          })
          .eq("id", selectedTemplate.id);

        if (error) {
          toast.error("Error updating template, try again later");
          console.error(error);
          return;
        }

        toast.success("Template updated successfully");
        router.push("/templates");
      }
    } catch (error) {
      toast.error("Error saving template, try again later");
      console.error(error);
    }
  };

  const nextStep = () => {
    if (step === 1 && isValid) {
      setStep(2);
    }
  };

  const prevStep = () => setStep(1);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("category")
        .select("id, name");
      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }
      const categoriesWithCount = data.map((category) => ({
        ...category,
        count: 0,
      }));
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase.from("tag").select("id, name");
      if (error) {
        console.error("Error fetching tags:", error);
        return;
      }
      const tagsWithCount = data.map((tag) => ({
        ...tag,
        count: 0,
      }));
      setTags(tagsWithCount);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [user]);

  useEffect(() => {
    if (selectedTemplate) {
      reset({
        tagId: selectedTemplate.tag?.id || "",
        categoryId: selectedTemplate.category?.id || "",
        templateName: selectedTemplate.subject || "",
        content: selectedTemplate.body || "",
        description: selectedTemplate?.description || "",
      });
    }
  }, [selectedTemplate, reset]);

  const getPreviewWidth = () => {
    switch (previewDevice) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-md";
      default:
        return "max-w-full";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Enhanced Header with Better Positioning */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/templates")}
                className="shrink-0"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Templates</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight truncate">
                    {selectedTemplate?.id
                      ? "Edit Template"
                      : "Create New Template"}
                  </h1>
                </div>
                <p className="text-muted-foreground text-sm lg:text-base">
                  {step === 1
                    ? "Enter basic template information"
                    : "Build your email template"}
                </p>
              </div>
            </div>

            {/* Step Indicator - Responsive */}
            <div className="flex items-center justify-between lg:justify-end gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 lg:gap-2">
                  <div
                    className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium transition-colors ${
                      step >= 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Info className="h-3 w-3 lg:h-4 lg:w-4" />
                  </div>
                  <div
                    className={`w-8 lg:w-12 h-0.5 transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`}
                  />
                  <div
                    className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium transition-colors ${
                      step >= 2
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Grid3X3 className="h-3 w-3 lg:h-4 lg:w-4" />
                  </div>
                </div>
              </div>

              {step === 2 && (
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={emailBlocks.length === 0}
                  className="shrink-0"
                >
                  <Save className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    {selectedTemplate?.id ? "Update Template" : "Save Template"}
                  </span>
                  <span className="sm:hidden">Save</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Step 1: Enhanced Basic Information with Better Responsive Layout */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <Card className="border shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xl lg:text-2xl">
                      Template Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provide basic details about your email template
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-6 lg:space-y-8"
                  onSubmit={handleSubmit(nextStep)}
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="templateName"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Type className="h-4 w-4" />
                      Template Name*
                    </Label>
                    <Input
                      id="templateName"
                      placeholder="e.g., Client Welcome Email"
                      {...register("templateName", {
                        required: "Template name is required",
                      })}
                      className="h-11 lg:h-12"
                    />
                    {errors.templateName && (
                      <p className="text-destructive text-sm">
                        {errors.templateName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="categoryId"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <FolderOpen className="h-4 w-4" />
                        Category*
                      </Label>
                      <Controller
                        name="categoryId"
                        control={control}
                        rules={{ required: "Category is required" }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="h-11 lg:h-12">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center gap-2">
                                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                    {cat.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.categoryId && (
                        <p className="text-destructive text-sm">
                          {errors.categoryId.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="tagId"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <FolderOpen className="h-4 w-4" />
                        Tag
                      </Label>
                      <Controller
                        name="tagId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="h-11 lg:h-12">
                              <SelectValue placeholder="Select a tag" />
                            </SelectTrigger>
                            <SelectContent>
                              {tags.map((tag) => (
                                <SelectItem key={tag.id} value={tag.id}>
                                  <div className="flex items-center gap-2">
                                    <FolderOpen className="h-3 w-3 text-muted-foreground" />
                                    {tag.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <AlignLeft className="h-4 w-4" />
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this template"
                      {...register("description")}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/templates")}
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isValid}
                      className="w-full sm:w-auto order-1 sm:order-2"
                    >
                      Continue
                      <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Enhanced Email Builder with Responsive Layout */}
        {step === 2 && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6 min-h-[calc(100vh-200px)]">
            {/* Left Panel - Email Builder - Responsive */}
            <div className="xl:col-span-5 flex flex-col gap-4">
              {/* Block Palette */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Layers className="h-5 w-5 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg">Content Blocks</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
                    {blockTypes.map(
                      ({ type, icon: Icon, label, description }) => (
                        <Button
                          key={type}
                          variant="outline"
                          onClick={() => addBlock(type as EmailBlock["type"])}
                          className="h-auto p-3 flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                          title={description}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{label}</span>
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Block Editor */}
              <Card className="flex-1 border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Settings className="h-5 w-5 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">Email Structure</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Layers className="h-3 w-3 mr-1" />
                        {emailBlocks.length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <div className="h-full max-h-[600px] xl:max-h-[500px] overflow-y-auto space-y-3 pr-2">
                    {emailBlocks.length === 0 ? (
                      <div className="flex items-center justify-center h-full min-h-[300px] text-muted-foreground">
                        <div className="text-center space-y-4">
                          <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto">
                            <MousePointer className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="font-medium">Start Building</p>
                            <p className="text-sm">
                              Add content blocks above to create your email
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      emailBlocks.map((block, index) => {
                        const blockType = blockTypes.find(
                          (b) => b.type === block.type
                        );
                        const Icon = blockType?.icon || Type;

                        return (
                          <Card
                            key={block.id}
                            className={`transition-all cursor-pointer hover:shadow-md ${
                              selectedBlockId === block.id
                                ? "ring-2 ring-primary bg-primary/5"
                                : "hover:bg-accent/50"
                            }`}
                            onClick={() => setSelectedBlockId(block.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <Icon className="h-4 w-4 shrink-0" />
                                  <span className="text-sm font-medium capitalize truncate">
                                    {block.type} Block
                                  </span>
                                  {selectedBlockId === block.id && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs shrink-0"
                                    >
                                      <Settings className="h-3 w-3 mr-1" />
                                      Active
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveBlock(block.id, "up");
                                    }}
                                    disabled={index === 0}
                                    className="h-7 w-7 p-0"
                                    title="Move up"
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveBlock(block.id, "down");
                                    }}
                                    disabled={index === emailBlocks.length - 1}
                                    className="h-7 w-7 p-0"
                                    title="Move down"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteBlock(block.id);
                                    }}
                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                    title="Delete block"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Block Content Editor */}
                              <div className="space-y-3">
                                {block.type === "text" && (
                                  <RichTextEditor
                                    value={
                                      block.content.html ||
                                      "<p>Enter your text here...</p>"
                                    }
                                    onChange={(html: any) =>
                                      updateBlock(block.id, {
                                        content: { ...block.content, html },
                                      })
                                    }
                                  />
                                )}

                                {block.type === "image" && (
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <ImageIcon className="h-3 w-3" />
                                        Image URL
                                      </Label>
                                      <Input
                                        placeholder="Image URL"
                                        value={block.content.src || ""}
                                        onChange={(e) =>
                                          updateBlock(block.id, {
                                            content: {
                                              ...block.content,
                                              src: e.target.value,
                                            },
                                          })
                                        }
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Type className="h-3 w-3" />
                                        Alt text
                                      </Label>
                                      <Input
                                        placeholder="Alt text"
                                        value={block.content.alt || ""}
                                        onChange={(e) =>
                                          updateBlock(block.id, {
                                            content: {
                                              ...block.content,
                                              alt: e.target.value,
                                            },
                                          })
                                        }
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                )}

                                {block.type === "link" && (
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Type className="h-3 w-3" />
                                        Link text
                                      </Label>
                                      <Input
                                        placeholder="Link text"
                                        value={block.content.text || ""}
                                        onChange={(e) =>
                                          updateBlock(block.id, {
                                            content: {
                                              ...block.content,
                                              text: e.target.value,
                                            },
                                          })
                                        }
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Link className="h-3 w-3" />
                                        URL
                                      </Label>
                                      <Input
                                        placeholder="URL"
                                        value={block.content.url || ""}
                                        onChange={(e) =>
                                          updateBlock(block.id, {
                                            content: {
                                              ...block.content,
                                              url: e.target.value,
                                            },
                                          })
                                        }
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                )}

                                {block.type === "video" && (
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Type className="h-3 w-3" />
                                        Video title
                                      </Label>
                                      <Input
                                        placeholder="Video title"
                                        value={block.content.title || ""}
                                        onChange={(e) =>
                                          updateBlock(block.id, {
                                            content: {
                                              ...block.content,
                                              title: e.target.value,
                                            },
                                          })
                                        }
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Video className="h-3 w-3" />
                                        Video URL
                                      </Label>
                                      <Input
                                        placeholder="Video URL"
                                        value={block.content.url || ""}
                                        onChange={(e) =>
                                          updateBlock(block.id, {
                                            content: {
                                              ...block.content,
                                              url: e.target.value,
                                            },
                                          })
                                        }
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                )}

                                {block.type === "spacer" && (
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                      <Layout className="h-3 w-3" />
                                      Height (e.g., 20px)
                                    </Label>
                                    <Input
                                      placeholder="Height (e.g., 20px)"
                                      value={block.content.height || ""}
                                      onChange={(e) =>
                                        updateBlock(block.id, {
                                          content: {
                                            ...block.content,
                                            height: e.target.value,
                                          },
                                        })
                                      }
                                      className="mt-1"
                                    />
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Enhanced Preview with Device Selection */}
            <div className="xl:col-span-7">
              <Card className="h-full border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Eye className="h-5 w-5 text-orange-600" />
                      </div>
                      <CardTitle className="text-lg">Live Preview</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                        <Button
                          variant={
                            previewDevice === "desktop" ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setPreviewDevice("desktop")}
                          className="h-7 px-2"
                          title="Desktop view"
                        >
                          <Monitor className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={
                            previewDevice === "tablet" ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setPreviewDevice("tablet")}
                          className="h-7 px-2"
                          title="Tablet view"
                        >
                          <Tablet className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={
                            previewDevice === "mobile" ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setPreviewDevice("mobile")}
                          className="h-7 px-2"
                          title="Mobile view"
                        >
                          <Smartphone className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        className="shrink-0"
                      >
                        <ChevronLeft className="mr-1 h-3 w-3" />
                        <span className="hidden sm:inline">Back</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <div className="h-full max-h-[600px] xl:max-h-[500px]  rounded-lg border-2 border-dashed border-gray-200 overflow-y-auto flex justify-center">
                    {emailBlocks.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground p-8">
                        <div className="text-center space-y-4">
                          <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto">
                            <Eye className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="font-medium">Preview Area</p>
                            <p className="text-sm">
                              Your email will appear here as you build it
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={` ${getPreviewWidth()} px-8 w-full`}>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: generateEmailHTML(),
                          }}
                          className="prose prose-sm max-w-none [&>div]:mb-4 [&>div>p]:mb-2 [&>div>h1]:mb-3 [&>div>h2]:mb-3 [&>div>h3]:mb-3"
                          style={{
                            fontFamily:
                              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            lineHeight: "2",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
