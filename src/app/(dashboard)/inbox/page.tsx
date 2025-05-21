import type { Metadata } from "next";
import { InboxHeader } from "@/components/inbox/inbox-header";
import { EmailList } from "@/components/inbox/email-list";
import { EmailPreview } from "@/components/inbox/email-preview";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export const metadata: Metadata = {
  title: "Inbox | ReachMate",
  description: "Manage your incoming emails",
};

export default function InboxPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <InboxHeader />
      <ResizablePanelGroup direction="horizontal" className="overflow-hidden">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <EmailList />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <EmailPreview />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
