"use client";

import { useAppSelector } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ModalName } from "@/store/slicers";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { closeModal } from "@/lib/modal";

export interface BaseModalProps<T> {
  onOpen?(data: T);
  onClose?();
  modalName: ModalName;
  Title?({ data }: { data?: T });
  Content?({ data }: { data?: T });
  Footer?({ data }: { data?: T });
  className?;
}
export default function BaseModal<T>({
  onOpen,
  onClose,
  modalName,
  Title,
  Content,
  Footer,
  className,
}: BaseModalProps<T>) {
  const modal = useAppSelector((state) => state.slicers.modal);
  //   const open =
  useEffect(() => {
    if (modal?.name == modalName) {
      onOpen && onOpen(modal?.data);
    }
  }, [modal, modalName]);
  return (
    <Dialog
      onOpenChange={(e) => {
        console.log(e);
        if (!e) {
          onClose?.();
          closeModal(modalName);
        }
      }}
      open={modal?.name == modalName}
    >
      <DialogContent className={cn(className)}>
        <DialogHeader>
          <DialogTitle>{Title && <Title data={modal?.data} />}</DialogTitle>
        </DialogHeader>
        {Content && <Content data={modal?.data} />}
        <DialogFooter>{Footer && <Footer data={modal?.data} />}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
