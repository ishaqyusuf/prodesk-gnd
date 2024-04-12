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
import useCommands from "./commands";

export function Cmd() {
    const [open, setOpen] = React.useState(false);

    const commands = useCommands();
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
                    {commands.commands.map((cmd, i) => (
                        <Link
                            onClick={() => setOpen(false)}
                            key={i}
                            href="/sales/edit/order/new"
                        >
                            <CommandItem
                                onClick={(e) => {
                                    console.log("....");
                                }}
                            >
                                {<cmd.Icon className="mr-2 h-4 w-4" />}
                                <span>{cmd.title}</span>
                                {cmd.shortCut && (
                                    <CommandShortcut>
                                        ⌘{cmd.shortCut}
                                    </CommandShortcut>
                                )}
                            </CommandItem>
                        </Link>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
