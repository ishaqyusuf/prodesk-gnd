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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props<T> {
    label?: string;
    placeholder?: string;
    className?: string;
    suffix?: string;
}
export default function ControlledInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TOptionType = any
>({
    label,
    placeholder,
    className,
    suffix,
    ...props
}: Partial<ControllerProps<TFieldValues, TName>> & Props<TOptionType>) {
    return (
        <FormField
            {...(props as any)}
            render={({ field }) => (
                <FormItem className={cn(className)}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <div
                            className={cn(
                                suffix && "flex items-center space-x-1"
                            )}
                        >
                            <Input placeholder={placeholder} {...field} />
                            {suffix && (
                                <Button type="button" variant={"outline"}>
                                    {suffix}
                                </Button>
                            )}
                        </div>
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
