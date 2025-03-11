"use client";

import {
    Combobox,
    ComboboxAnchor,
    ComboboxBadgeItem,
    ComboboxBadgeList,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxGroupLabel,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxSeparator,
    ComboboxTrigger,
} from "@/components/ui/combobox";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
const tricks = [
    { label: "Kickflip", value: "kickflip" },
    { label: "Heelflip", value: "heelflip" },
    { label: "Tre Flip", value: "tre-flip" },
    { label: "FS 540", value: "fs-540" },
    { label: "Casper flip 360 flip", value: "casper-flip-360-flip" },
    { label: "Kickflip Backflip", value: "kickflip-backflip" },
    { label: "360 Varial McTwist", value: "360-varial-mc-twist" },
    { label: "The 900", value: "the-900" },
];
const groupedTricks = {
    "Basic Tricks": tricks.slice(0, 3),
    "Advanced Tricks": tricks.slice(3, 5),
    "Pro Tricks": tricks.slice(5),
};
export function ShelfItems({ itemStepUid }) {
    const [value, setValue] = React.useState<string[]>([]);
    const [open, onOpenChange] = useState(false);
    return (
        <div className="">
            <Combobox
                open={open}
                onOpenChange={onOpenChange}
                value={value}
                onValueChange={setValue}
                multiple
                className="w-[400px]"
                autoHighlight
            >
                <ComboboxLabel>Trick</ComboboxLabel>
                <ComboboxAnchor className="h-full flex-wrap px-3 py-2">
                    <ComboboxBadgeList>
                        {value.map((item) => {
                            const option = tricks.find(
                                (trick) => trick.value === item
                            );
                            if (!option) return null;

                            return (
                                <ComboboxBadgeItem
                                    onClick={(e) => {
                                        console.log(e);
                                    }}
                                    key={item}
                                    value={item}
                                >
                                    {option.label}
                                </ComboboxBadgeItem>
                            );
                        })}
                    </ComboboxBadgeList>
                    <ComboboxInput
                        onFocus={(e) => {
                            onOpenChange(true);
                        }}
                        placeholder="Select trick..."
                    />
                    <ComboboxTrigger className="absolute top-3 right-2">
                        <ChevronDown className="h-4 w-4" />
                    </ComboboxTrigger>
                </ComboboxAnchor>
                <ComboboxContent>
                    <ComboboxEmpty>No tricks found</ComboboxEmpty>
                    {Object.entries(groupedTricks).map(
                        ([category, items], index) => (
                            <React.Fragment key={category}>
                                <ComboboxGroup>
                                    <ComboboxGroupLabel>
                                        {category}
                                    </ComboboxGroupLabel>
                                    {items.map((trick) => (
                                        <ComboboxItem
                                            key={trick.value}
                                            value={trick.value}
                                            outset
                                        >
                                            {trick.label}
                                        </ComboboxItem>
                                    ))}
                                </ComboboxGroup>
                                {index <
                                    Object.entries(groupedTricks).length -
                                        1 && <ComboboxSeparator />}
                            </React.Fragment>
                        )
                    )}
                </ComboboxContent>
            </Combobox>
        </div>
    );
}
