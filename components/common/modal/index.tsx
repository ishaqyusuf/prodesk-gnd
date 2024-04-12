"use client";

import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ModalType, useModal } from "./provider";
import {
    Sheet,
    SheetContent,
    SheetContentProps,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { PrimitiveDivProps } from "@radix-ui/react-dialog";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Btn from "@/components/_v1/btn";
import { Icons } from "@/components/_v1/icons";

function BaseModal({
    children,
    showModal,
    setShowModal,
    type,
}: {
    children: React.ReactNode;
    showModal: boolean;
    type: ModalType;
    setShowModal: Dispatch<SetStateAction<boolean>>;
}) {
    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowModal(false);
            }
        },
        [setShowModal]
    );
    const Modal = type == "modal" ? Dialog : Sheet;
    useEffect(() => {
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [onKeyDown]);

    return (
        <>
            {showModal && (
                <>
                    {
                        <>
                            <Modal open={showModal} onOpenChange={setShowModal}>
                                {/* <ModalContent> {children}</ModalContent> */}
                                {children}
                            </Modal>
                        </>
                    }
                </>
            )}
        </>
    );
}
const contentVariants = cva(``, {
    variants: {
        size: {
            sm: "w-[350px]",
            md: "w-[500px]",
            lg: "w-[700px]",
            xl: "w-[900px]",
            "2xl": "",
        },
    },
    defaultVariants: {
        size: "md",
    },
});
interface ContentProps
    extends PrimitiveDivProps,
        VariantProps<typeof contentVariants> {
    side?: SheetContentProps["side"];
}
function Content({ children, size, ...props }: ContentProps) {
    const modal = useModal();
    const Content = modal?.data?.type == "modal" ? DialogContent : SheetContent;

    return (
        <Content
            {...props}
            className={cn(
                contentVariants({ size }),
                props.className,
                "sm:max-w-none"
            )}
        >
            {children}
        </Content>
    );
}

interface HeaderProps {
    title?: string;
    subtitle?: string;
    onBack?;
}
function Header({ title, subtitle, onBack }: HeaderProps) {
    const modal = useModal();
    const isModal = modal?.data?.type == "modal";
    const [Header, Title, Subtitle] = isModal
        ? [DialogHeader, DialogTitle, DialogDescription]
        : [SheetHeader, SheetTitle, SheetDescription];
    return (
        <Header>
            <div className={cn(onBack && "flex space-x-4")}>
                {onBack && (
                    <div>
                        <Button
                            onClick={onBack}
                            variant={"secondary"}
                            size={"icon"}
                        >
                            <Icons.chevronLeft className="w-4 h-4" />
                        </Button>
                    </div>
                )}
                <div className="flex-1">
                    {title && <Title>{title}</Title>}
                    {subtitle && <Subtitle>{subtitle}</Subtitle>}
                </div>
            </div>
        </Header>
    );
}
interface FooterProps extends PrimitiveDivProps {
    onSubmit?;
    onCancel?;
    submitText?: string;
    cancelBtn?: boolean;
    cancelText?: string;
}
function Footer({
    children,
    onSubmit,
    onCancel,
    submitText = "Submit",
    cancelBtn,
    cancelText = "Cancel",
}: FooterProps) {
    const modal = useModal();
    const isModal = modal?.data?.type == "modal";
    const [Footer] = isModal ? [DialogFooter] : [SheetFooter];
    return (
        <Footer className="flex space-x-4">
            {children}
            {(onSubmit || cancelBtn) && (
                <div className="flex justify-end space-x-4">
                    {cancelBtn && (
                        <Button
                            variant={"secondary"}
                            onClick={() => {
                                onCancel ? onCancel() : modal?.close();
                            }}
                        >
                            {cancelText}
                        </Button>
                    )}
                    {onSubmit && (
                        <Btn
                            isLoading={modal?.loading}
                            onClick={() => modal?.startTransition(onSubmit)}
                        >
                            {submitText}
                        </Btn>
                    )}
                </div>
            )}
        </Footer>
    );
}
export default Object.assign(BaseModal, {
    Content,
    Header,
    Footer,
});