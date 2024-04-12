"use client";
import React from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from "../ui/command";
import Link from "next/link";

export function Cmd() {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <Link href="/sales/edit/order/new">
                        <CommandItem>
                            Orders
                            <CommandShortcut>⌘O</CommandShortcut>
                        </CommandItem>
                    </Link>
                    <Link
                        href="/sales/edit/order/new"
                        onClick={() => setOpen(false)}
                    >
                        <CommandItem>
                            New Order
                            <CommandShortcut>⌘N</CommandShortcut>
                        </CommandItem>
                    </Link>
                    <Link href="/sales/edit/order/new">
                        <CommandItem>
                            Estimates
                            <CommandShortcut>⌘E</CommandShortcut>
                        </CommandItem>
                    </Link>
                    <Link href="/sales/edit/order/new">
                        <CommandItem>
                            New Estimate
                            <CommandShortcut>⌘E</CommandShortcut>
                        </CommandItem>
                    </Link>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
