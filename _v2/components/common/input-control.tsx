import { FormField, FormItem } from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { FieldPath, useFormContext } from "react-hook-form";

interface Props<T> extends InputProps {
    // @ts-ignore
    name: FieldPath<T>;
    placeholder?;
    switchInput?: Boolean;
}
export default function InputControl<T>({
    name,
    placeholder,
    className,
    switchInput,
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
                        {switchInput ? (
                            <Switch
                                checked={field.value as any}
                                onCheckedChange={field.onChange}
                            />
                        ) : (
                            <Input
                                {...props}
                                className={cn(className)}
                                {...field}
                            />
                        )}
                    </FormItem>
                )}
            />
        </div>
    );
}
