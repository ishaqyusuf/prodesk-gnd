import { useTransition } from "react";
import { IconKeys, Icons } from "../_v1/icons";
import { ButtonProps, Button as BaseButton } from "../ui/button";
import { cn } from "@/lib/utils";

interface BtnProps extends ButtonProps {
    action?;
    text?;
    icon?: IconKeys;
}
export default function Button({
    onClick,
    action,
    text,
    icon,
    ...props
}: BtnProps) {
    const BtnIcon = icon ? Icons[icon] : null;
    const [loading, startLoader] = useTransition();
    async function _action() {
        if (action) {
            startLoader((async () => {
                const resp = action();
                if (resp instanceof Promise) {
                    await resp;
                }
            }) as any);
        }
    }
    return (
        <BaseButton
            className={cn(props.className, "relative")}
            onClick={_action}
            {...props}
        >
            <div className={cn("inline-flex", loading && "opacity-0")}>
                {BtnIcon && (
                    <BtnIcon
                        className={cn(
                            "h-4 w-4",
                            (text || props.children) && "mr-2"
                        )}
                    />
                )}
                {props.children}
                {text && <span>{text}</span>}
            </div>
            <div
                className={cn("absolute", loading ? "opacity-10" : "opacity-0")}
            >
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            </div>
        </BaseButton>
    );
}
