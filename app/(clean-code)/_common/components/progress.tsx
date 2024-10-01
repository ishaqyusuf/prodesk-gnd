import { statusColor } from "@/lib/status-badge";
import { cn } from "@/lib/utils";

function ProgressBase({ children }) {
    return <div>{children}</div>;
}
interface StatusProps {
    noDot?: boolean;
    children;
}
function Status({ children, noDot }: StatusProps) {
    const _color = statusColor(children);
    return (
        <div className="inline-flex items-center gap-2 font-semibold">
            {!noDot && (
                <div className={cn("w-1.5 h-1.5", `bg-${_color}-500`)}></div>
            )}

            <div className={cn(`text-${_color}-500`, "text-xs uppercase")}>
                {children}
            </div>
        </div>
    );
}
function ProgressBar({ children }) {
    return <div>{children}</div>;
}
export const Progress = Object.assign(ProgressBase, {
    Status,
    ProgressBar,
});
