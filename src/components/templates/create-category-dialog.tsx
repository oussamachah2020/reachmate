"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { FolderPlus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";

type FormData = {
  name: string;
  description: string;
};

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("category").insert({
        name: data.name,
        authorId: user?.id,
      });

      if (error) {
        console.error(error);
        toast.error("Something went wrong, please try again !");
        return;
      }

      toast.success("Category created successfully!");
      setOpen(false);
      reset();
    } catch (err) {
      toast.error("Failed to create category. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <FolderPlus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your email templates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Category Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Client Onboarding"
              {...register("name", { required: "Category name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this category"
              rows={3}
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
