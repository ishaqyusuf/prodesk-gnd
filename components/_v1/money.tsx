import { cn, formatCurrency } from "@/lib/utils";

interface Props {
  value;
  validOnly?: Boolean;
  className?: string;
}
export default function Money({ value, validOnly, className }: Props) {
  if (!value) value = 0;
  if (!value && validOnly) return null;
  return <span className={cn(className)}>{formatCurrency.format(value)}</span>;
}
