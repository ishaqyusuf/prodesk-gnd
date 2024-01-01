"use client";

import { useEffect, useRef, useState } from "react";
import { useCombobox } from "downshift";
import { Label } from "../../ui/label";
import { PrimitiveDivProps } from "@radix-ui/react-tabs";
import { cn, uniqueBy } from "@/lib/utils";
import { Input } from "../../ui/input";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebounce } from "@/hooks/use-debounce";
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
    virt?: Boolean;
    placeholder?;
    form?;
}
export default function AutoComplete({
    options,
    value,
    onChange,
    virt,
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
    const [items, setItems] = useState(
        transformItems(options || [], itemText, itemValue)
    );
    const {
        isOpen,
        highlightedIndex,
        getInputProps,
        getMenuProps,
        getItemProps,
        selectedItem,
    } = useCombobox({
        items,
        // inputValue: "lorem",
        initialInputValue: value,
        onSelectedItemChange(c) {
            // console.log(c);
            onSelect && onSelect(c.selectedItem as any);
            onChange && onChange((c.selectedItem as any)?.value);
        },
        onInputValueChange({ inputValue }) {
            setItems(
                filter(
                    transformItems(options || [], itemText, itemValue),
                    inputValue
                )
            );
            onChange && onChange(inputValue);
        },
        stateReducer: (state, actionAndChanges) => {
            const { changes, type } = actionAndChanges;
            switch (type) {
                // case useCombobox.stateChangeTypes.
                case useCombobox.stateChangeTypes.InputBlur:
                    // console.log(changes.inputValue);
                    // onChange && onChange(changes.inputValue);
                    return {
                        ...changes,
                    };
            }
            return {
                ...changes,
            };
        },
        itemToString(item) {
            return item ? (item as any).title : "";
        },
    });
    const listRef = useRef<HTMLDivElement>();
    const rowVirtualizer = useVirtualizer({
        count: items.length,
        // parentRef: listRef,
        getScrollElement: () => listRef.current as any,
        estimateSize: (index) => 40,
        // overscan: 2,
    });
    const inputRef = useRef<HTMLInputElement>();
    return (
        <div>
            <div className="grid relative gap-2">
                {label && <Label>{label}</Label>}

                <div className="flex">
                    <Input
                        className={cn(uppercase && "uppercase", className)}
                        {...getInputProps({ ref: inputRef as any })}
                    />
                </div>
            </div>
            {/* {isOpen && */}
            {/* `opened ${JSON.stringify(inputRef.current?.clientWidth)}`} */}
            <ul
                style={{
                    width: `${inputRef.current?.clientWidth}px`,
                }}
                className={cn(
                    "absolute border w-full bg-white mt-1 shadow-md max-h-80 overflow-scroll p-0 z-10",
                    !(isOpen && items.length) && "hidden",
                    "min-w-[150px]"
                )}
                {...getMenuProps({ ref: listRef as any })}
            >
                {isOpen && (
                    <>
                        {items
                            .filter((item, index) => index < 25)
                            .map((item, index) => (
                                <li
                                    className={cn(
                                        highlightedIndex === index &&
                                            "bg-blue-300",
                                        selectedItem === item && "font-bold",
                                        "py-2 px-3 shadow-sm flex flex-col cursor-default"
                                    )}
                                    key={index}
                                    {...getItemProps({
                                        item: item,
                                        index,
                                    })}
                                >
                                    <span
                                        className={cn(
                                            uppercase && "uppercase",
                                            "line-clamp-1"
                                        )}
                                    >
                                        {item?.title}
                                    </span>
                                </li>
                            ))}
                    </>
                )}
                {isOpen && virt && (
                    <>
                        <li
                            key="total-size"
                            style={{ height: rowVirtualizer.getTotalSize() }}
                        />
                        {rowVirtualizer.getVirtualItems().map((vi, index) => (
                            <li
                                className={cn(
                                    highlightedIndex === index && "bg-blue-300",
                                    selectedItem === items[vi.index] &&
                                        "font-bold",
                                    "py-2 px-3 shadow-sm flex flex-col cursor-default",
                                    uppercase && "uppercase"
                                )}
                                key={vi.key}
                                {...getItemProps({
                                    item: items[vi.index],
                                    index,
                                })}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: vi.size,
                                    transform: `translateY(${vi.start}px)`,
                                }}
                            >
                                <span
                                    className={cn(
                                        uppercase && "uppercase",
                                        "line-clamp-1"
                                    )}
                                >
                                    {items[vi.index]?.title}
                                </span>
                            </li>
                        ))}
                    </>
                )}
            </ul>
        </div>
    );
}
function filter(items, query) {
    const escapedText = !query
        ? ""
        : query?.toString().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    const pattern = new RegExp(escapedText, "i");
    let filteredOptions = items?.filter((option) => pattern.test(option.title));
    return uniqueBy(filteredOptions, "title");
}
function transformItems(items, itemText, itemValue) {
    return items
        ?.map((item) => {
            return typeof item == "string"
                ? { title: item, value: item, data: item }
                : {
                      title: item?.[itemText],
                      value: item?.[itemText],
                      data: item,
                  };
        })
        .filter((item) => item.title);
}
