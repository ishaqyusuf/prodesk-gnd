"use client";

import { IOrderType, ISalesOrder } from "@/types/sales";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Banknote,
  Copy,
  MoreHorizontal,
  Pen,
  ShoppingBag,
  View,
} from "lucide-react";
import Link from "next/link";
import { typedMemo } from "@/lib/hocs/typed-memo";
import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { copyOrderAction } from "@/app/_actions/sales";
import { toast } from "sonner";

export interface IOrderRowProps {
  row: ISalesOrder;
  viewMode?: Boolean;
  estimate?: Boolean;
  print?(mode: IOrderType | "production");
}
export function OrderRowAction(props: IOrderRowProps) {
  const { row, viewMode, estimate } = props;
  const _linkDir = `/sales/order/${row.slug}`;

  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[185px]">
          <Link href={_linkDir}>
            <DropdownMenuItem>
              <View className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              View
            </DropdownMenuItem>
          </Link>
          <Link href={`${_linkDir}/form?orderId=${row.orderId}`}>
            <DropdownMenuItem>
              <Pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Edit
            </DropdownMenuItem>
          </Link>
          <CopyOrderMenuAction row={row} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const CopyOrderMenuAction = typedMemo((props: IOrderRowProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const _copyOrder = useCallback(
    async (as: IOrderType = "order") => {
      startTransition(async () => {
        const _ = await copyOrderAction({
          orderId: props.row.orderId,
          as,
        });
        toast.success(`${as} copied successfully`, {
          action: {
            label: "Open",
            onClick: () => router.push(`/sales/${as}/form?orderId=${_.slug}`),
          },
        });
      });
    },
    [props.row]
  );
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Copy As
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem
          onClick={() => {
            _copyOrder("estimate");
          }}
        >
          <Banknote className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Estimates
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            _copyOrder("order");
          }}
        >
          <ShoppingBag className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Order
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
});
