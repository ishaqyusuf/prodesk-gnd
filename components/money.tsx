import { toFixed } from "@/lib/use-number";
import { cn } from "@/lib/utils";

interface Props {
  value;
  className?: string;
}
export default function Money({ value, className }: Props) {
  if (!value) value = 0;
  return <span className={cn(className)}>${toFixed(value)}</span>;
}
