import { toFixed } from "@/lib/use-number";
import { cn } from "@/lib/utils";

interface Props {
  value;
  validOnly?: Boolean;
  className?: string;
}
export default function Money({ value, validOnly, className }: Props) {
  if (!value) value = 0;
  if (!value && validOnly) return null;
  return <span className={cn(className)}>${toFixed(value)}</span>;
}
