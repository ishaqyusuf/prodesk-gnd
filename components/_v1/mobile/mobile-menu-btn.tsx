"use client";

import { ModalName } from "@/store/slicers";
import { Button } from "../../ui/button";
import { MenuIcon, MoreHorizontal } from "lucide-react";
import { openModal } from "@/lib/modal";
import { PrimitiveButtonProps } from "@radix-ui/react-dropdown-menu";

interface Props {
    modal: ModalName;
    data;
}
export default function MobileMenuBtn({ modal, data }: Props) {
    return (
        <Button
            onClick={() => {
                openModal(modal, data);
            }}
            size="icon"
            className="p-0 h-5 w-5"
            variant={"secondary"}
        >
            <MoreHorizontal className="w-4 h-4" />
        </Button>
    );
}
