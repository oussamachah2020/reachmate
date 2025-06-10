"use client";

import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
} from "lucide-react";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useTemplateStore } from "@/zustand/template.store";
import { templatePrompts, templateVariables } from "@/constants";

type FormValues = {
  templateName: string;
  categoryId: string;
  tagId: string;
  description: string;
  content: string;
};

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  trigger: ReactNode;
};

export function CreateTemplateDialog({ open, setOpen, trigger }: Props) {
  const [step, setStep] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState("edit");
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
      - Use HTML formatting for professional appearance
      - Include template variables like [First Name], [Company], [Email] where appropriate
      - Make it professional and business-appropriate
      - Include proper email structure (greeting, body, closing)
      - Keep it concise but complete
      - Use modern email design principles
      - Use inline CSS for styling if needed for better email client compatibility

      Generate only the HTML content for the email body, no additional text or explanations.`;

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

      // Set the content in the form
      setValue("content", generatedContent, { shouldValidate: true });

      // Close AI generator and switch to edit tab to show the result
      setShowAIGenerator(false);
      setActiveTab("edit");

      // Show success message
      toast.success(
        "✨ Template generated successfully! You can now edit or preview it."
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
          tagId: data.tagId,
          senderId: user?.id,
        });

        if (error) {
          toast.error("Error creating template, try again later");
          console.error(error);
          return;
        }

        toast.success("Template created successfully");
        setOpen(false);
      } else {
        const { error } = await supabase
          .from("template")
          .update({
            subject: data.templateName,
            description: data.description,
            body: data.content,
            categoryId: data.categoryId,
            tagId: data.tagId,
            senderId: user?.id,
          })
          .eq("id", selectedTemplate.id);

        if (error) {
          toast.error("Error creating template, try again later");
          console.error(error);
          return;
        }

        toast.success("Template updated successfully");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Error creating template, try again later");
      console.error(error);
    } finally {
      setOpen(false);
      reset();
      setStep(1);
      setActiveTab("edit");
      setShowAIGenerator(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && isValid) {
      setStep(2);
    }
  };
  const prevStep = () => setStep(1);

  React.useEffect(() => {
    if (!open) {
      reset();
      setStep(1);
      setActiveTab("edit");
      setShowAIGenerator(false);
      setSelectedPrompt("");
      setCustomPrompt("");
    }
  }, [open, reset]);

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
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="w-[100vw] h border border-gray-100 dark:border-gray-700 ">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Create New Email Template
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {step === 1
              ? "Enter basic template information"
              : "Create your template content"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          // Step 1: Basic Info Form
          <div className="flex-1 overflow-y-auto">
            <form className="grid gap-4 py-4" onSubmit={handleSubmit(nextStep)}>
              <div className="space-y-2">
                <Label
                  htmlFor="templateName"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Template Name*
                </Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Client Welcome"
                  {...register("templateName", {
                    required: "Template name is required",
                  })}
                  aria-invalid={errors.templateName ? "true" : "false"}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
                {errors.templateName && (
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {errors.templateName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="categoryId"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Category*
                </Label>
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="categoryId"
                        className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      >
                        <SelectValue
                          placeholder="Select a category"
                          className="text-gray-500 dark:text-gray-400"
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.id}
                            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="tagId"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Tag
                </Label>
                <Controller
                  name="tagId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="tagId"
                        className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      >
                        <SelectValue
                          placeholder="Select a tag"
                          className="text-gray-500 dark:text-gray-400"
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        {tags.map((tag) => (
                          <SelectItem
                            key={tag.id}
                            value={tag.id}
                            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this template"
                  {...register("description")}
                  rows={2}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <DialogFooter className="flex items-center justify-between sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-gray-300 dark:border-gray-600  dark:text-gray-100 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid}
                  className=" text-white"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-row">
            {/* AI Generator Section */}
            {showAIGenerator && (
              <div className="mb-6 relative flex-shrink-0">
                {/* Loading Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 animate-pulse mx-auto" />
                        <div className="absolute inset-0 h-8 w-8 border-2 border-purple-600/30 dark:border-purple-400/30 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400 mx-auto"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                          Generating your template...
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          This may take a few seconds
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6 border-2 border-dashed border-purple-200 dark:border-purple-700/50 rounded-xl bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-indigo-50/50 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 text-lg">
                        AI Template Generator
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        Let AI create a professional email template for you
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-gray-900 dark:text-gray-100 font-medium">
                        Template Type
                      </Label>
                      <Select
                        value={selectedPrompt}
                        onValueChange={setSelectedPrompt}
                        disabled={isGenerating}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 h-12">
                          <SelectValue
                            placeholder="Choose a template type..."
                            className="text-gray-500 dark:text-gray-400"
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          {templatePrompts.map((prompt) => (
                            <SelectItem
                              key={prompt.name}
                              value={prompt.name}
                              className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 py-3"
                            >
                              <div className="space-y-1">
                                <div className="font-medium">{prompt.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
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
                        <Label className="text-gray-900 dark:text-gray-100 font-medium">
                          Custom Requirements
                        </Label>
                        <Textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="Describe your email template needs in detail. For example: 'Create a professional follow-up email for potential clients who downloaded our whitepaper. Include a call-to-action to schedule a demo.'"
                          rows={4}
                          disabled={isGenerating}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Be specific about the purpose, tone, and any special
                          requirements
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        onClick={generateTemplate}
                        disabled={
                          !selectedPrompt ||
                          isGenerating ||
                          (selectedPrompt === "Custom Request" &&
                            !customPrompt.trim())
                        }
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-600 dark:to-blue-600 dark:hover:from-purple-700 dark:hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Template
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAIGenerator(false);
                          setSelectedPrompt("");
                          setCustomPrompt("");
                        }}
                        disabled={isGenerating}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-2.5"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex flex-col flex-1 min-h-0"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <TabsTrigger
                  value="edit"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-400"
                >
                  Edit
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-400"
                >
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="flex-1 min-h-0 mt-4">
                <div className="space-y-4 h-full flex flex-col">
                  {!showAIGenerator && !watchedContent && (
                    <div className="text-center py-8 space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Create Your Email Template
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          Start typing your email content or use our AI
                          generator to create a professional template instantly.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowAIGenerator(true)}
                        className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 mt-4"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate with AI
                      </Button>
                    </div>
                  )}

                  {!showAIGenerator && watchedContent && (
                    <div className="flex justify-end mb-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowAIGenerator(true)}
                        className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Regenerate with AI
                      </Button>
                    </div>
                  )}

                  <div className="flex-1 min-h-0">
                    <Controller
                      name="content"
                      control={control}
                      rules={{
                        required: "Content cannot be empty",
                        validate: (value) =>
                          value.trim() !== ""
                            ? true
                            : "Content cannot be empty",
                      }}
                      render={({ field }) => (
                        <div className="h-[400px]">
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            variables={templateVariables}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="preview"
                className="border rounded-md p-4 min-h-[400px] max-h-[400px] overflow-y-auto prose prose-sm max-w-none mt-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-a:text-blue-600 dark:prose-a:text-blue-400"
              >
                {watchedContent ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: watchedContent }}
                    className="template-content text-gray-900 dark:text-gray-100"
                  />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 italic">
                    Preview will appear here
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex items-center justify-between sm:justify-between mt-4 flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4">
              <Button
                variant="outline"
                onClick={prevStep}
                className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={!watchedContent?.trim()}
                className=" text-white"
              >
                {selectedTemplate?.id ? "Edit Template" : "Save Template"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}