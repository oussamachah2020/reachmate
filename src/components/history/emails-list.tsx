import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Mail,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Reply,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { EmailHistory } from "@/types/history";
import { toast } from "sonner";

interface EmailHistoryListProps {
  emails: EmailHistory[];
  isLoading?: boolean;
}

export function EmailHistoryList({ emails, isLoading }: EmailHistoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter emails based on search and status
  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      searchTerm === "" ||
      email.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || email.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "replied":
        return "text-green-600 bg-green-100";
      case "opened":
        return "text-blue-600 bg-blue-100";
      case "delivered":
        return "text-yellow-600 bg-yellow-100";
      case "sent":
        return "text-gray-600 bg-gray-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "replied":
        return <Reply className="h-4 w-4" />;
      case "opened":
        return <Eye className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "sent":
        return <Mail className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  // Actions
  const quickSendEmail = (recipientEmail: string) => {
    window.location.href = `/compose?to=${encodeURIComponent(recipientEmail)}`;
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email address copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="opened">Opened</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Email List */}
      <div className="space-y-2">
        {filteredEmails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No emails found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <Card key={email.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {email.subject}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}
                      >
                        {getStatusIcon(email.status)}
                        <span className="ml-1 capitalize">{email.status}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>
                        To: {email.recipientName || email.recipientEmail}
                      </span>
                      <span>•</span>
                      <span>{new Date(email.sentAt).toLocaleDateString()}</span>
                      {email.templateSubject && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">
                            Template: {email.templateSubject}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => quickSendEmail(email.recipientEmail)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => copyEmail(email.recipientEmail)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => quickSendEmail(email.recipientEmail)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send New Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
