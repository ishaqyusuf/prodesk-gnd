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

interface Props<T> {
    label?;
    placeholder?;
    options?: T[];
    SelectItem?({ option }: { option: T });
    Item?({ option }: { option: T });
    valueKey?: keyof T;
    titleKey?: keyof T;
}
export default function ControlledSelect<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TOptionType = any
>({
    label,
    placeholder,
    options,
    SelectItem: SelItem,
    valueKey = "value" as any,
    titleKey = "title" as any,
    Item,
    ...props
}: Partial<ControllerProps<TFieldValues, TName>> & Props<TOptionType>) {
    function itemValue(option) {
        return typeof option == "string" ? option : option[valueKey];
    }
    function itemText(option) {
        return typeof option == "string" ? option : option[titleKey];
    }
    return (
        <FormField
            {...(props as any)}
            render={({ field }) => (
                <FormItem className="">
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {options?.map((option, index) =>
                                    SelItem ? (
                                        <SelItem option={option} key={index} />
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
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
