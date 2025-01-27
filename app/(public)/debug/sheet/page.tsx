"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Menu } from "@/components/(clean-code)/menu";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useState } from "react";

export default function Page({}) {
    const [open, menuOpenChange] = useState(false);
    return (
        <>
            <Sheet open>
                <SheetContent side="bottomRight">
                    <SheetHeader>Test</SheetHeader>
                    <div className="">
                        {open || "CLOSED"}
                        <DropdownMenu open={open} onOpenChange={menuOpenChange}>
                            <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Item 1</DropdownMenuItem>
                                <DropdownMenuItem>Item 2</DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        Item 3
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem>
                                            Sub Item 1
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            Sub Item 2
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
