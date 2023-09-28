"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { openModal } from "@/lib/modal";

export default function TaskAction({}) {
    const { data: session } = useSession({
        required: false
    });
    const can = session?.can;
    const [actions, setTabs] = useState(
        [
            can?.viewTech && "punchout",
            can?.viewInstallation && "installation",
            can?.viewDecoShutterInstall && "Deco-Shutter"
        ].filter(Boolean)
    );
    if (actions.length == 1)
        return (
            <Button
                onClick={() => {
                    openModal("submitJob", {
                        type: actions?.[0]?.toLowerCase()
                    });
                }}
                size="sm"
                className="h-8"
            >
                <Plus className="h-4 w-4 mr-2" />
                <span>Task</span>
            </Button>
        );
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" className="h-8">
                        <Plus className="h-4 w-4 mr-2" />
                        <span>Task</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {actions.map(a => (
                        <DropdownMenuItem
                            onClick={() => {
                                openModal("submitJob", {
                                    type: a?.toLowerCase()
                                });
                            }}
                            className="capitalize"
                            key={a}
                        >
                            {a}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
