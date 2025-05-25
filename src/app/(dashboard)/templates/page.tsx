"use client";
import type { Metadata } from "next";
import { TemplatesHeader } from "@/components/templates/templates-header";
import { TemplatesList } from "@/components/templates/templates-list";
import { TemplateCategories } from "@/components/templates/template-categories";
import { useState } from "react";

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);

  const handleFilteredCountChange = (count: number) => {
    setFilteredCount(count);
  };

  return (
    <div className="space-y-6">
      <TemplatesHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalTemplates={totalTemplates}
        filteredCount={filteredCount}
      />
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <TemplateCategories />
        </div>
        <div className="md:col-span-3">
          <TemplatesList
            searchQuery={searchQuery}
            sortBy={sortBy}
            onFilteredCountChange={handleFilteredCountChange}
          />
        </div>
      </div>
    </div>
  );
}
