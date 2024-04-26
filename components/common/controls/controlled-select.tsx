import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";

interface Props<T> {
    label?;
    placeholder?;
    options?: T[];
    SelectItem?({ option }: { option: T });
    Item?({ option }: { option: T });
    valueKey?: keyof T;
    titleKey?: keyof T;
    onSelect?(selection: T);
    loader?;
    className?: string;
    type?: "select" | "combo";
    transformValue?(value?);
}
export default function ControlledSelect<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TOptionType = any
>({
    label,
    placeholder,
    options = [],
    loader,
    SelectItem: SelItem,
    valueKey = "value" as any,
    titleKey = "label" as any,
    type = "select",
    onSelect,
    className,
    Item,
    transformValue,
    ...props
}: Partial<ControllerProps<TFieldValues, TName>> & Props<TOptionType>) {
    const [list, setList] = useState<any>([]);
    useEffect(() => {
        setList(options || []);
        // console.log(options?.length);
    }, [options]);
    useEffect(() => {
        if (loader) {
            (async () => {
                const ls = await loader();
                setList(ls);
                console.log(ls);
            })();
        }
    }, []);
    function itemValue(option) {
        if (!option) return option;
        return typeof option == "string" ? option : option[valueKey];
    }
    function itemText(option) {
        if (!option) return option;
        return typeof option == "string"
            ? option
            : titleKey == "label"
            ? option[titleKey] || option["text"]
            : option[titleKey];
    }
    return (
        <FormField
            {...(props as any)}
            render={({ field }) => (
                <FormItem className={cn(className, "mx-1")}>
                    {label && <FormLabel>{label}</FormLabel>}

                    <FormControl>
                        {type == "combo" ? (
                            <ControlledCombox
                                field={field}
                                placeholder={placeholder}
                                onSelect={(s) => {
                                    let value = itemValue(s);
                                    if (transformValue)
                                        value = transformValue(value);

                                    field?.onChange(value);
                                    onSelect && onSelect(value);
                                    // onSelect;
                                }}
                                options={list}
                                itemValue={itemValue}
                                itemText={itemText}
                            />
                        ) : (
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={placeholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(loader ? list : options)?.map(
                                        (option, index) =>
                                            SelItem ? (
                                                <SelItem
                                                    option={option}
                                                    key={index}
                                                />
                                            ) : (
                                                <SelectItem
                                                    key={index}
                                                    value={itemValue(option)}
                                                >
                                                    {Item ? (
                                                        <Item option={option} />
                                                    ) : (
                                                        <>{itemText(option)}</>
                                                    )}
                                                </SelectItem>
                                            )
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
export function ControlledCombox({
    field,
    placeholder,
    onSelect,
    options,
    itemText,
    itemValue,
}) {
    const [show, setShow] = useState(false);
    return (
        <Popover open={show} onOpenChange={setShow}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        onClick={() => {
                            setShow(!show);
                        }}
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                        )}
                    >
                        {/* {field.value
                    ? data.find(
                        (sel) => sel. === field.value
                      )?.label
                    : "Select language"} */}
                        {/* <span>{options.length}</span> */}
                        <span className="">
                            {field.value
                                ? itemText(
                                      options.find(
                                          (o) => itemValue(o) == field.value
                                      )
                                  )
                                : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="min-w-[250px] max-w-[400px] p-0 ">
                <Command>
                    <CommandInput
                        onValueChange={(e) => {
                            // console.log(e);
                            // setValue(e);
                        }}
                        placeholder={placeholder}
                        className="h-9"
                    />
                    <CommandEmpty>Nothing to display.</CommandEmpty>
                    <CommandGroup className="max-h-[35vh] overflow-auto">
                        {options?.map((opt, index) => (
                            <CommandItem
                                value={itemValue(opt)}
                                key={index}
                                onSelect={() => {
                                    onSelect && onSelect(opt);
                                    setShow(false);
                                }}
                            >
                                {itemText(opt)}
                                <CheckIcon
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        itemValue(opt) === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
