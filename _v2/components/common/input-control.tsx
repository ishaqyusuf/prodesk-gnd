import { FormField, FormItem } from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FieldPath, useFormContext } from "react-hook-form";

interface Props<T> extends InputProps {
    name: FieldPath<T>; // @ts-ignore
    placeholder?;
}
export default function InputControl<T>({
    name,
    placeholder,
    className,
    ...props
}: Props<T>) {
    const form = useFormContext();

    return (
        <div>
            <FormField
                name={name}
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <Input
                            {...props}
                            className={cn(className)}
                            {...field}
                        />
                    </FormItem>
                )}
            />
        </div>
    );
}
