import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  children: ReactNode;
  content: string;
  openPreview: boolean;
  setOpenPreview: Dispatch<SetStateAction<boolean>>;
};

const PreviewDialog = ({
  children,
  content,
  openPreview,
  setOpenPreview,
}: Props) => {
  return (
    <Dialog open={openPreview} onOpenChange={() => setOpenPreview(false)}>
      {children}
      <DialogContent className="h-[50rem] overflow-auto">
        <DialogHeader>
          <DialogTitle>Template Preview</DialogTitle>
        </DialogHeader>
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className="template-content"
        />
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
