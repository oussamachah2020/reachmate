"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  RefreshCcw,
  Archive,
  Trash2,
  Tag,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function InboxHeader() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="border-b bg-white p-4">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">Inbox</h1>
          <div className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            12 unread
          </div>
        </div>

        <div className="flex flex-1 items-center space-x-2 md:mx-4 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search emails..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All emails</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="attachments">With attachments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" title="Refresh">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Archive">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Tag">
            <Tag className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark all as read</DropdownMenuItem>
              <DropdownMenuItem>Mark selected as unread</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Move to folder</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
