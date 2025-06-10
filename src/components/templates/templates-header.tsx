"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Grid3X3, List, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useViewModeStore } from "@/zustand/global.store";
import { useRouter } from "next/navigation";

interface TemplatesHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  totalTemplates: number;
  filteredCount: number;
}

export function TemplatesHeader({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  totalTemplates,
  filteredCount,
}: TemplatesHeaderProps) {
  const { viewMode, setViewMode } = useViewModeStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const clearSearch = () => {
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Email Templates
          </h1>
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {filteredCount} of {totalTemplates}
            </Badge>
          )}
        </div>
        <Button
          onClick={() => router.push("/templates/new")}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
        {/* <CreateTemplateDialog
          open={open}
          setOpen={setOpen}
          trigger={
            <Button
              onClick={() => setOpen(true)}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          } 
        />*/}
      </div>

      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search templates by name, description, or content..."
            className="w-full pl-8 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0 hover:bg-gray-100"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Created</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center rounded-md border  p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className={`h-8 w-8 ${
                viewMode === "grid"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className={`h-8 w-8 ${
                viewMode === "list"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          <Badge
            variant="secondary"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Search: "{searchQuery}"
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 h-4 w-4 p-0 hover:bg-green-100"
              onClick={clearSearch}
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
}