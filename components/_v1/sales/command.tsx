"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandDialogProps } from "../../ui/command";

const CatalogCommandDialog = ({
    children,
    shouldFilter,
    ...props
}: CommandDialogProps) => {
    return (
        <Dialog {...props}>
            <DialogContent className="overflow-hidden p-0 shadow-2xl sm:max-w-3xl sm:min-w-3xl">
                <Command
                    shouldFilter={shouldFilter}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
                >
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    );
};

export { CatalogCommandDialog };
