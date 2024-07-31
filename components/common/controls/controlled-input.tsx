import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props<T> {
    label?: string;
    placeholder?: string;
    className?: string;
    suffix?: string;
    type?: string;
    list?: boolean;
    size?: "sm" | "default" | "xs";
    // defaultValue?:boolean
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
    type,
    list,
    size = "default",
    ...props
}: Partial<ControllerProps<TFieldValues, TName>> & Props<TOptionType>) {
    return (
        <FormField
            {...(props as any)}
            render={({ field, fieldState }) => (
                <FormItem className={cn(className, "mx-1")}>
                    {label && (
                        <FormLabel
                            className={cn(fieldState.error && "border-red-400")}
                        >
                            {label}
                        </FormLabel>
                    )}
                    <FormControl>
                        <div
                            className={cn(
                                suffix && "flex items-center space-x-1",
                                ""
                            )}
                        >
                            {type == "textarea" ? (
                                <Textarea
                                    placeholder={placeholder}
                                    className={cn(
                                        fieldState.error && "border-red-400"
                                    )}
                                    {...(list
                                        ? {
                                              defaultValue: field.value,
                                              onChange: field.onChange,
                                          }
                                        : field)}
                                    // value={""}
                                />
                            ) : (
                                <Input
                                    type={type}
                                    placeholder={placeholder}
                                    // {...field}
                                    // value={""}
                                    className={cn(
                                        fieldState.error && "border-red-400",
                                        size == "sm" && "h-8"
                                    )}
                                    {...(list
                                        ? {
                                              defaultValue: field.value,
                                              //   onChange: field.onChange,
                                          }
                                        : field)}
                                    // onChange={field.onChange}
                                    // defaultValue={field.value}
                                    onChange={(e) => {
                                        if (type == "number")
                                            e.target.value
                                                ? field.onChange(
                                                      e.target.value
                                                          ? Number(
                                                                e.target.value
                                                            )
                                                          : null
                                                  )
                                                : field.onChange(null);
                                        else field.onChange(e);
                                    }}
                                />
                            )}
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
