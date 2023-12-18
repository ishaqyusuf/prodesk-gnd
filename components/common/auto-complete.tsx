"use client";

import { useState } from "react";
import { useCombobox } from "downshift";
import { Label } from "../ui/label";
import { PrimitiveDivProps } from "@radix-ui/react-tabs";
import { Combobox } from "@headlessui/react";
import { cn } from "@/lib/utils";

interface Props {
    options?: any[];
    value?: any;
    onChange?;
    Item?;
    itemText?;
    itemValue?;
    label?;
    transformValue?;
    disabled?;
    transformText?;
    searchAction?;
    searchFn?;
    allowCreate?;
    formKey?;
    uppercase?: Boolean;
    hideEmpty?: Boolean;
    placeholder?;
    form?;
}
export default function AutoComplete({
    options,
    value,
    onChange,
    disabled,
    label,
    searchAction,
    allowCreate,
    itemText = "name",
    itemValue = "id",
    className,
    Item,
    hideEmpty,
    searchFn,
    form,
    placeholder,
    formKey,
    uppercase,
    onSelect,
    ...props
}: Props & PrimitiveDivProps) {
    const [items, setItems] = useState(options || []);
    const { isOpen } = useCombobox({
        items,
        onSelectedItemChange(c) {},
    });
    return (
        <div className="grid relative gap-2">
            {label && <Label>{label}</Label>}
        </div>
    );
}
