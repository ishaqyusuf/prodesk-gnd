"use client";

import { useAppSelector } from "@/store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { ModalName } from "@/store/slicers";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { closeModal } from "@/lib/modal";

export interface BaseModalProps<T> {
    onOpen?(data: T);
    onClose?();
    modalName: ModalName | string;
    Title?({ data }: { data?: T });
    Subtitle?({ data }: { data?: T });
    Content?({ data }: { data?: T });
    Footer?({ data }: { data?: T });
    className?;
    noFooter?: Boolean;
}
export default function BaseModal<T>({
    onOpen,
    onClose,
    modalName,
    Title,
    Subtitle,
    Content,
    Footer,
    className,
    noFooter,
}: BaseModalProps<T>) {
    const modal = useAppSelector((state) => state.slicers?.modal);
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
                    <DialogTitle>
                        {Title && <Title data={modal?.data} />}
                    </DialogTitle>
                    <DialogDescription>
                        {Subtitle && <Subtitle data={modal?.data} />}
                    </DialogDescription>
                </DialogHeader>
                {Content && <Content data={modal?.data} />}
                {!noFooter && (
                    <DialogFooter>
                        {Footer && <Footer data={modal?.data} />}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
