"use client";

import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Sparkles, Loader2, Save, Eye, Edit3 } from "lucide-react";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useTemplateStore } from "@/zustand/template.store";
import { templatePrompts, templateVariables } from "@/constants";
import { useRouter } from "next/navigation";

type FormValues = {
  templateName: string;
  categoryId: string;
  tagId: string;
  description: string;
  content: string;
};

export default function CreateTemplatePage() {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("edit");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const { user } = useAuthStore();
  const [categories, setCategories] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const [tags, setTags] = useState<
    { id: string; name: string; count: number }[]
  >([]);

  const { selectedTemplate } = useTemplateStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
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

  const watchedContent = watch("content");

  // Generate template with Claude API
  const generateTemplate = async () => {
    setIsGenerating(true);

    try {
      const promptToUse =
        selectedPrompt === "Custom Request"
          ? customPrompt
          : templatePrompts.find((p) => p.name === selectedPrompt)?.prompt ||
            "";

      if (!promptToUse.trim()) {
        toast.error("Please provide a description for your template");
        setIsGenerating(false);
        return;
      }

      const enhancedPrompt = `${promptToUse}

      Requirements:
      - Generate PLAIN TEXT HTML only - no CSS styling, colors, backgrounds, or containers
      - Use only basic HTML tags: <p>, <h1>, <h2>, <h3>, <strong>, <em>, <br>, <ul>, <li>, <ol>
      - NO inline styles, NO CSS classes, NO div containers, NO borders, NO background colors
      - Include template variables like [First Name], [Company], [Email] where appropriate
      - Make it professional and business-appropriate
      - Include proper email structure (greeting, body, closing)
      - Keep it clean and simple with just basic HTML formatting
      - Use line breaks (<br>) and paragraphs (<p>) for spacing
      - NO decorative elements, boxes, or visual styling

      Generate only the plain HTML content for the email body with basic formatting tags only.`;

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: enhancedPrompt,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate template");
      }

      const data = await response.json();

      // Clean up the response to ensure it's just HTML
      let generatedContent = data.response.trim();

      // Remove any markdown code blocks if present
      generatedContent = generatedContent
        .replace(/```html\n?/g, "")
        .replace(/```\n?/g, "");

      // Remove any inline styles or CSS classes that might have been added
      generatedContent = generatedContent
        .replace(/style="[^"]*"/g, "")
        .replace(/class="[^"]*"/g, "")
        .replace(/<div[^>]*>/g, "")
        .replace(/<\/div>/g, "");

      // Set the content in the form
      setValue("content", generatedContent, { shouldValidate: true });

      // Show success message
      toast.success(
        "✨ Plain text template generated successfully! You can now edit or preview it."
      );
    } catch (error) {
      console.error("Error generating template:", error);
      toast.error("Failed to generate template. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

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

  React.useEffect(() => {
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

        setCategories([...categoriesWithCount]);
      } catch (error) {
        console.error(error);
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
        console.error(error);
      }
    };

    fetchCategories();
    fetchTags();
  }, [user]);

  React.useEffect(() => {
    if (selectedTemplate) {
      reset({
        tagId: selectedTemplate.tag?.id,
        categoryId: selectedTemplate.category?.id,
        templateName: selectedTemplate.subject,
        content: selectedTemplate.body,
        description: selectedTemplate?.description || "",
      });
    }
  }, [selectedTemplate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/templates")}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Templates
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {selectedTemplate?.id
                    ? "Edit Template"
                    : "Create New Template"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {step === 1
                    ? "Enter basic template information"
                    : "Create your plain text template content"}
                </p>
              </div>
            </div>

            {step === 2 && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  className="text-gray-800"
                  onClick={() =>
                    setActiveTab(activeTab === "edit" ? "preview" : "edit")
                  }
                >
                  {activeTab === "edit" ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </>
                  ) : (
                    <>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={!watchedContent?.trim()}
                  className="text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {selectedTemplate?.id ? "Update Template" : "Save Template"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {step === 1 ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-xl border p-8">
              <form className="space-y-6" onSubmit={handleSubmit(nextStep)}>
                <div className="space-y-2">
                  <Label htmlFor="templateName" className="text-sm font-medium">
                    Template Name*
                  </Label>
                  <Input
                    id="templateName"
                    placeholder="e.g., Client Welcome Email"
                    {...register("templateName", {
                      required: "Template name is required",
                    })}
                    className="h-12"
                  />
                  {errors.templateName && (
                    <p className="text-destructive text-sm">
                      {errors.templateName.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId" className="text-sm font-medium">
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
                          <SelectTrigger className="h-12 w-full">
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
                      )}
                    />
                    {errors.categoryId && (
                      <p className="text-destructive text-sm">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagId" className="text-sm font-medium">
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
                          <SelectTrigger className="h-12 w-full">
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
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
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

                <div className="flex items-center justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/templates")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid}
                    className="px-8 text-white"
                  >
                    Continue
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
            <div className="bg-card rounded-xl border p-6 flex flex-col">
              <div className="relative flex-1">
                {isGenerating && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Sparkles className="h-8 w-8 text-primary animate-pulse mx-auto" />
                        <div className="absolute inset-0 h-8 w-8 border-2 border-primary/30 rounded-full animate-spin border-t-primary mx-auto"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Generating your plain text template...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Creating clean, simple content without styling
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        AI Plain Text Template Generator
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Generate clean, simple email templates without styling
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 flex-1">
                    <div className="space-y-2">
                      <Label className="font-medium">Template Type</Label>
                      <Select
                        value={selectedPrompt}
                        onValueChange={setSelectedPrompt}
                        disabled={isGenerating}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Choose a template type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templatePrompts.map((prompt) => (
                            <SelectItem
                              key={prompt.name}
                              value={prompt.name}
                              className="py-3"
                            >
                              <div className="space-y-1">
                                <div className="font-medium">{prompt.name}</div>
                                <div className="text-sm text-muted-foreground leading-tight">
                                  {prompt.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPrompt === "Custom Request" && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <Label className="font-medium">
                          Custom Requirements
                        </Label>
                        <Textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="Describe your email template needs in detail..."
                          rows={6}
                          disabled={isGenerating}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          Be specific about the purpose, tone, and any special
                          requirements. Template will be generated as plain text
                          without styling.
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={generateTemplate}
                      disabled={
                        !selectedPrompt ||
                        isGenerating ||
                        (selectedPrompt === "Custom Request" &&
                          !customPrompt.trim())
                      }
                      className="w-full h-12 text-white"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Plain Text Template...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Plain Text Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6 flex flex-col">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="edit">
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="flex-1 min-h-0">
                  <Controller
                    name="content"
                    control={control}
                    rules={{
                      required: "Content cannot be empty",
                      validate: (value) =>
                        value.trim() !== "" ? true : "Content cannot be empty",
                    }}
                    render={({ field }) => (
                      <div className="h-full">
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          variables={templateVariables}
                        />
                      </div>
                    )}
                  />
                </TabsContent>

                <TabsContent value="preview" className="flex-1 min-h-0">
                  <div className="h-full overflow-y-auto p-6 bg-white rounded border">
                    {watchedContent ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: watchedContent }}
                        className="prose prose-sm max-w-none"
                        style={{
                          color: "#000",
                          fontSize: "14px",
                          lineHeight: "1.5",
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground italic">
                        Plain text preview will appear here when you add content
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Basic Info
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
