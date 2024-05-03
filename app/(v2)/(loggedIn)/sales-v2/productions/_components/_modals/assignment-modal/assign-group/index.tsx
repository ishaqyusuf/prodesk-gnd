"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAssignmentData } from "..";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssignGroup({ index }) {
    const data = useAssignmentData();
    const group = data.data.doorGroups[index];
    const [open, onOpenChange] = useState(false);
    if (!group) return null;

    return (
        <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger
                asChild
                disabled={group.report.pendingAssignment == 0}
            >
                <Button
                    onClick={() => onOpenChange(!open)}
                    disabled={group.report.pendingAssignment == 0}
                    size={"sm"}
                >
                    Assign ({group.report.pendingAssignment})
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <Card className="w-[350px] border-transparent">
                    <CardHeader>
                        <CardTitle>Assign</CardTitle>
                    </CardHeader>
                    <CardContent></CardContent>
                </Card>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
