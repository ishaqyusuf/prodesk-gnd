import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

interface Props<T> {
    label?: string;
    size?: "sm" | "default" | "xs";
    length;
    startIndex?: number;
    disabled?: boolean;
}
export default function NumberPicker<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TOptionType = any
>({
    label,
    size,
    length,
    disabled,
    startIndex = 1,
    ...props
}: Partial<ControllerProps<TFieldValues, TName>> & Props<TOptionType>) {
    const inputs = Array(length)
        .fill(null)
        ?.map((_, i) => startIndex + i);
    return (
        <FormField
            {...(props as any)}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <div className="flex items-center">
                        {label && <FormLabel>{label}</FormLabel>}
                        <div className="flex-1"></div>

                        <Button
                            disabled={field.value == null}
                            variant="link"
                            size="sm"
                            onClick={() => {
                                field.onChange(null);
                            }}
                            className="h-7"
                        >
                            Clear
                        </Button>
                    </div>
                    <FormControl>
                        <div className="flex gap-2 flex-wrap">
                            {disabled && !inputs.length ? (
                                <Button disabled></Button>
                            ) : null}
                            {inputs.map((i) => (
                                <Button
                                    disabled={disabled}
                                    variant={
                                        (field.value || 0) >= i
                                            ? "default"
                                            : "secondary"
                                    }
                                    onClick={() => {
                                        field.onChange(i);
                                    }}
                                    key={i}
                                    size={size as any}
                                >
                                    {i}
                                </Button>
                            ))}
                        </div>
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
