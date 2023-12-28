import { FormControl, FormField, FormItem } from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FieldPath, UseFormProps, useFormContext } from "react-hook-form";

interface Props<T> {
    name: FieldPath<T>; // @ts-ignore
    placeholder?;
    options?: any[];
    className?;
}
export default function SelectControl<T>({
    name,
    placeholder,
    className,
    options,
}: Props<T>) {
    const form = useFormContext();
    function itemText(option) {
        if (typeof option === "object") {
            return option.text;
        }
        return option;
    }
    function itemValue(option) {
        if (typeof option === "object") {
            return option.value;
        }
        return option;
    }
    return (
        <div>
            <FormField
                name={name}
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <Select
                            defaultValue={field.value}
                            onValueChange={(e) => {
                                field.onChange(e);
                            }}
                        >
                            <FormControl>
                                <SelectTrigger className={cn("", className)}>
                                    <SelectValue placeholder={placeholder} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {options?.map((option, index) => (
                                    <SelectItem
                                        key={index}
                                        value={itemValue(option)}
                                    >
                                        {itemText(option)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />
        </div>
    );
}
