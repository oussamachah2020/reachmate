"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { InboxHeader } from "@/components/inbox/inbox-header";
import { EmailList } from "@/components/inbox/email-list";
import { EmailPreview } from "@/components/inbox/email-preview";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Email } from "@/types/inbox";

export default function InboxPage() {
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [emailList, setEmailList] = useState<Email[]>([]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col relative">
      <InboxHeader />
      {/* Inbox layout */}
      <ResizablePanelGroup direction="horizontal" className="overflow-hidden">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <EmailList
            activeEmail={activeEmail}
            setActiveEmail={setActiveEmail}
            emailList={emailList}
            setEmailList={setEmailList}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <EmailPreview activeEmail={activeEmail} emailList={emailList} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
