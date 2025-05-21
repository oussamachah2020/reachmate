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
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useTemplateStore } from "@/zustand/template.store";

// Template variables
const templateVariables = [
  { name: "First Name", value: "[First Name]" },
  { name: "Last Name", value: "[Last Name]" },
  { name: "Company", value: "[Company]" },
  { name: "Email", value: "[Email]" },
  { name: "Phone", value: "[Phone]" },
  { name: "Date", value: "[Date]" },
  { name: "Address", value: "[Address]" },
  { name: "Custom Field", value: "[Custom Field]" },
];

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
      }
    } catch (error) {
      toast.error("Error creating template, try again later");
      console.error(error);
    } finally {
      setOpen(false);
      reset();
      setStep(1);
      setActiveTab("edit");
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
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Create New Email Template</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter basic template information"
              : "Create your template content"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          // Step 1: Basic Info Form
          <form className="grid gap-4 py-4" onSubmit={handleSubmit(nextStep)}>
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name*</Label>
              <Input
                id="templateName"
                placeholder="e.g., Client Welcome"
                {...register("templateName", {
                  required: "Template name is required",
                })}
                aria-invalid={errors.templateName ? "true" : "false"}
              />
              {errors.templateName && (
                <p className="text-red-600 text-sm">
                  {errors.templateName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category*</Label>
              <Controller
                name="categoryId"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
                )}
              />
              {errors.categoryId && (
                <p className="text-red-600 text-sm">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagId">Tag</Label>
              <Controller
                name="tagId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this template"
                {...register("description")}
                rows={2}
              />
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <Controller
                  name="content"
                  control={control}
                  rules={{
                    required: "Content cannot be empty",
                    validate: (value) =>
                      value.trim() !== "" ? true : "Content cannot be empty",
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      variables={templateVariables}
                    />
                  )}
                />
              </TabsContent>
              <TabsContent
                value="preview"
                className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none mt-2"
              >
                {watchedContent ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: watchedContent }}
                    className="template-content"
                  />
                ) : (
                  <div className="text-gray-400 italic">
                    Preview will appear here
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex items-center justify-between sm:justify-between mt-4">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={!watchedContent?.trim()}
              >
                {selectedTemplate?.id ? "Edit Template" : "Save Template"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
