"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateCategoryDialog } from "@/components/templates/create-category-dialog";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function TemplateCategories() {
  const [categories, setCategories] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const [tags, setTags] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const { user } = useAuthStore();

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from("category").delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete category.");
        console.error("Delete category error:", error);
        return;
      }
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast.success("Category deleted.");
    } catch (error) {
      toast.error("Failed to delete category.");
      console.error(error);
    }
  };

  const handleDeleteTag = async (id: string) => {
    console.log(id);
    try {
      const { error } = await supabase.from("tag").delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete tag.");
        console.error("Delete tag error:", error);
        return;
      }
      setTags((prev) => prev.filter((tag) => tag.id !== id));
      toast.success("Tag deleted.");
    } catch (error) {
      toast.error("Failed to delete tag.");
      console.error(error);
    }
  };

  const handleAddTag = async () => {
    try {
      const trimmedName = newTagName.trim();
      if (!trimmedName || !user?.id) return;

      const { error } = await supabase.from("tag").insert({
        name: trimmedName,
        authorId: user.id,
      });

      if (error) {
        toast.error("Failed to create category. Please try again.");
        console.error("Error adding tag:", error);
        return;
      }

      toast.success("Tag created successfully!");
    } catch (error) {
      toast.error("Failed to create category. Please try again.");
      console.error("Error adding tag:", error);
    } finally {
      setNewTagName("");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("category")
          .select("id, name");

        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }

        const defaultCategory = {
          id: "all",
          name: "All Templates",
          count: data?.length || 0,
        };

        const categoriesWithCount = data.map((category) => ({
          ...category,
          count: 0,
        }));

        setCategories([defaultCategory, ...categoriesWithCount]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCategories(false);
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
      } finally {
        setLoadingTags(false);
      }
    };

    fetchCategories();
    fetchTags();

    const categoryChannel = supabase
      .channel("category-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "category" },
        (payload) => {
          const newCategory = payload.new;
          setCategories((prev) => [
            ...prev,
            {
              id: newCategory.id,
              name: newCategory.name,
              count: 0,
            },
          ]);
        }
      )
      .subscribe();

    const tagChannel = supabase
      .channel("tag-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tag" },
        (payload) => {
          const newTag = payload.new;
          setTags((prev) => [
            ...prev,
            {
              id: newTag.id,
              name: newTag.name,
              count: 0,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(categoryChannel);
      supabase.removeChannel(tagChannel);
    };
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="rounded-lg border ">
        <div className="border-b p-3">
          <h3 className="font-medium">Categories</h3>
        </div>
        <ScrollArea className="h-[220px]">
          <div className="p-2">
            {loadingCategories ? (
              <p className="text-sm text-gray-500 px-2">Loading...</p>
            ) : (
              categories.map((category) => (
                <ContextMenu key={category.id}>
                  <ContextMenuTrigger disabled={category.id === "all"}>
                    <div className="mb-1 flex w-full items-center justify-between rounded px-2">
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex-1 justify-between pr-2",
                          category.id === "all"
                            ? "bg-primary/10 text-primary"
                            : ""
                        )}
                      >
                        <span className="">{category.name}</span>
                        {category.id === "all" ? (
                          <span className="ml-2 rounded-full bg-gray-100 text-primary px-2 py-0.5 text-xs ">
                            {category.count}
                          </span>
                        ) : null}
                      </Button>
                    </div>
                  </ContextMenuTrigger>
                  {category.id !== "all" && (
                    <ContextMenuContent>
                      <ContextMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash className="h-4 w-4 mr-2 text-red-500" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  )}
                </ContextMenu>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-3">
          <CreateCategoryDialog />
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-lg border ">
        <div className="border-b p-3">
          <h3 className="font-medium">Popular Tags</h3>
        </div>
        <div className="p-3">
          <div className="flex flex-wrap gap-2">
            {loadingTags ? (
              <p className="text-sm text-gray-500">Loading tags...</p>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center rounded-full border  px-3 py-1 text-xs"
                >
                  {tag.name}
                  {/* <span className="ml-1 text-gray-500">({tag.count})</span> */}
                  <Button
                    onClick={() => handleDeleteTag(tag.id)}
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-5 w-5 rounded-full p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                    aria-label={`Delete tag ${tag.name}`}
                  >
                    <X className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="border-t p-3">
          <div className="flex space-x-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Add tag"
              className="h-8 text-xs"
            />
            <Button size="icon" className="h-8 w-8" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
