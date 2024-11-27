import Button from "@/components/common/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverPortal,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

interface Props<T> {
    label?;
    options?: (T | { label: string; value: string })[];
    labelKey?: keyof (T & { label: string; value: string });
    valueKey?: keyof (T & { label: string; value: string });
    className?;
}

export function ComboxBox<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TOptionType = any
>({
    valueKey = "value",
    label,
    labelKey = "label",
    className,
    ...props
}: Partial<ControllerProps<TFieldValues, TName>> & Props<TOptionType>) {
    const filterFields = props.options;
    const optValue = (opt) => opt?.[valueKey];
    const optLabel = (opt) => opt?.[labelKey];
    return (
        <FormField
            {...(props as any)}
            render={({ field }) => (
                <FormItem className={cn(className, "mx-1")}>
                    {label && <FormLabel>{label}</FormLabel>}

                    <Popover modal>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    //   id={fieldTriggerId}
                                    variant="outline"
                                    size="sm"
                                    role="combobox"
                                    aria-label="Select filter field"
                                    //   aria-controls={fieldListboxId}
                                    className="h-8 w-32 justify-between gap-2 rounded focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0"
                                >
                                    <span className="truncate">
                                        {optLabel(
                                            filterFields.find(
                                                (opt) =>
                                                    optValue(opt) ===
                                                    field.value
                                            )
                                        ) ?? "Select field"}
                                    </span>
                                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverPortal>
                            <PopoverContent
                                // id={fieldListboxId}
                                // align="start"
                                className="w-40 p-0"
                                // onCloseAutoFocus={() =>
                                //   document.getElementById(fieldTriggerId)?.focus({
                                //     preventScroll: true,
                                //   })
                                // }
                            >
                                <Command>
                                    <CommandInput placeholder="Search fields..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            No fields found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {filterFields.map((opt) => (
                                                <CommandItem
                                                    key={optValue(opt)}
                                                    value={optValue(opt)}
                                                    onSelect={(value) => {
                                                        const filterField =
                                                            filterFields.find(
                                                                (col) =>
                                                                    optValue(
                                                                        col
                                                                    ) === value
                                                            );

                                                        if (!filterField)
                                                            return;

                                                        // updateFilter({
                                                        //     rowId: filter.rowId,
                                                        //     field: {
                                                        //         id: value as StringKeyOf<TData>,
                                                        //         type: filterField.type,
                                                        //         operator:
                                                        //             getDefaultFilterOperator(
                                                        //                 filterField.type
                                                        //             ),
                                                        //         value: "",
                                                        //     },
                                                        // });

                                                        // document
                                                        //     .getElementById(
                                                        //         fieldTriggerId
                                                        //     )
                                                        //     ?.click();
                                                    }}
                                                >
                                                    <span className="mr-1.5 truncate">
                                                        {optLabel(opt)}
                                                    </span>
                                                    <Check
                                                        className={cn(
                                                            "ml-auto size-4 shrink-0",
                                                            optValue(opt) ===
                                                                field.value
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </PopoverPortal>
                    </Popover>
                </FormItem>
            )}
        />
    );
}
