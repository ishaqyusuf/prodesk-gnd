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
import { ModalContextProps, ModalType, useModal } from "./provider";
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
import { Button, ButtonProps } from "@/components/ui/button";
import Btn from "@/components/_v1/btn";
import { Icons } from "@/components/_v1/icons";
import { useFormContext } from "react-hook-form";

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
            sm: "w-full sm:w-[350px]",
            md: "w-full sm:w-[500px]",
            lg: "w-full sm:w-[700px] md:w-full",
            xl: "w-full sm:w-[900px] md:w-full",
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
    title?: string | any;
    subtitle?: string | any;
    onBack?;
    icon?: keyof typeof Icons;
    children?;
}
function Header({ title, icon, subtitle, onBack, children }: HeaderProps) {
    const modal = useModal();
    const isModal = modal?.data?.type == "modal";
    const [Header, Title, Subtitle] = isModal
        ? [DialogHeader, DialogTitle, DialogDescription]
        : [SheetHeader, SheetTitle, SheetDescription];
    const Icon = Icons[icon] || undefined;
    return (
        <Header>
            <div className="flex">
                <div className={cn(onBack && "flex sm:space-x-4")}>
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
                    <div className="flex-1 whitespace-nowrap flex-col justify-start">
                        <div className="flex items-center">
                            {Icon && <Icon className="w-4 h-4 mr-4" />}
                            {title && <Title>{title}</Title>}
                        </div>
                        {subtitle && <Subtitle>{subtitle}</Subtitle>}
                    </div>
                </div>
                {children}
            </div>
        </Header>
    );
}
interface FooterProps {
    children?;
    onSubmit?(modal: ModalContextProps);
    onCancel?(modal: ModalContextProps);
    submitText?: string;
    cancelBtn?: boolean;
    cancelText?: string;
    cancelVariant?: ButtonProps["variant"];
    submitVariant?: ButtonProps["variant"];
}
function Footer({
    children,
    onSubmit,
    onCancel,
    submitText = "Submit",
    cancelBtn,
    cancelText = "Cancel",
    cancelVariant = "secondary",
    submitVariant = "default",
}: FooterProps) {
    const modal = useModal();
    const isModal = modal?.data?.type == "modal";
    const [Footer] = isModal ? [DialogFooter] : [SheetFooter];
    const form = useFormContext();
    return (
        <Footer className="flex space-x-4">
            {children}
            {(onSubmit || cancelBtn) && (
                <div className="flex justify-end space-x-4">
                    {cancelBtn && (
                        <Button
                            variant={cancelVariant}
                            onClick={() => {
                                onCancel ? onCancel(modal) : modal?.close();
                            }}
                        >
                            {cancelText}
                        </Button>
                    )}
                    {onSubmit && (
                        <Btn
                            variant={submitVariant}
                            isLoading={modal?.loading}
                            onClick={async () => {
                                if (form) {
                                    const resp = await form.trigger();
                                    // console.log(resp);
                                    if (!resp) return;
                                }
                                modal?.startTransition(() => onSubmit(modal));
                            }}
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
