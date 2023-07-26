"use client";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { dispatchSlice, ISlicer } from "@/store/slicers";
import { HTMLAttributes, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface Props extends HTMLAttributes<HTMLDivElement> {
  slicer: keyof ISlicer;
  title?;
  onOpen?(items);
  onClose?(callback);
}
export default function BaseDialog({
  children,
  className,
  title,
  slicer,
  onOpen,
}: Props) {
  const [open, setOpen] = useState(false);
  const _sl = useAppSelector((state) => state.slicers[slicer]);
  useEffect(() => {
    const opened = _sl != null;
    setOpen(opened);
    if (opened && onOpen) onOpen(_sl);
  }, [_sl]);
  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
        if (!e) dispatchSlice(slicer);
      }}
    >
      <DialogContent className={cn("sm:max-w-[500px]", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {_sl != null && children}
      </DialogContent>
    </Dialog>
  );
}
