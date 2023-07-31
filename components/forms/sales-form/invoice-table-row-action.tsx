import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell } from "@/components/ui/table";
import { store, useAppSelector } from "@/store";
import { openItemComponent } from "@/store/invoice-item-component-slice";
import { ISalesOrderForm } from "@/types/sales";

import {
  ArrowDown,
  ArrowUp,
  Delete,
  Layers,
  MoreHorizontal,
  Move,
  Plus,
  Trash,
} from "lucide-react";

export default function InvoiceTableRowAction({
  form,
  rowIndex,
  addLine,
}: {
  rowIndex: number;
  form: ISalesOrderForm;
  addLine(toIndex);
}) {
  const orderItemComponentSlice = useAppSelector(
    (state) => state.orderItemComponent
  );
  const baseKey: any = `items.${rowIndex}`;
  return (
    <TableCell className="p-0 px-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => {
              store.dispatch(
                openItemComponent({
                  rowIndex,
                  item: form.getValues(baseKey),
                })
              );
            }}
          >
            <Layers className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Component
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Delete className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Clear
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Plus className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Add Line
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => addLine(rowIndex - 1)}>
                <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Before
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addLine(rowIndex + 1)}>
                <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                After
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Move className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Move To
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>1</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  );
}
