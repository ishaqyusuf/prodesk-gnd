import { cn } from "@/lib/utils";
import { Icons } from "../icons";
import { Button } from "../ui/button";

export default function Btn({
  isLoading = false,
  children,
  icon = false,
  className = "",
  ...props
}) {
  return (
    <Button
      {...props}
      className={cn(className)}
      disabled={isLoading || props.disabled}
    >
      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      {icon && isLoading ? null : children}
    </Button>
  );
}
