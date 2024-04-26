import {
    ControllerProps,
    FieldPath,
    FieldValues,
    useFormContext,
} from "react-hook-form";
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
}
export default function ControlledSelect<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TOptionType = any
>({
    label,
    placeholder,
    options,
    loader,
    SelectItem: SelItem,
    valueKey = "value" as any,
    titleKey = "label" as any,
    type = "select",
    onSelect,
    className,
    Item,
    ...props
}: Partial<ControllerProps<TFieldValues, TName>> & Props<TOptionType>) {
    const [list, setList] = useState(options || []);
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
        return typeof option == "string" ? option : option[valueKey];
    }
    function itemText(option) {
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
                                onSelect={onSelect}
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
    return (
        <Popover>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
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
                        <span className="">{field.value || placeholder}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
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
                    <CommandGroup>
                        {options?.map((language, index) => (
                            <CommandItem
                                value={itemValue(language)}
                                key={index}
                                onSelect={() => {
                                    field.onChange(itemValue(language));
                                    onSelect && onSelect(language);
                                    // data.setValue("language", language.value);
                                }}
                            >
                                {itemText(language)}
                                <CheckIcon
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        itemValue(language) === field.value
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
