"use client";

import { IOrderPrintMode, IOrderType, ISalesOrder } from "@/types/sales";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Banknote,
  BookOpen,
  Check,
  Construction,
  Copy,
  FlagIcon,
  Info,
  ListOrderedIcon,
  MessageSquarePlus,
  MoreHorizontal,
  Pen,
  Printer,
  ShoppingBag,
  Trash,
  View,
  X,
} from "lucide-react";
import Link from "next/link";
import { typedMemo } from "@/lib/hocs/typed-memo";
import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { copyOrderAction, deleteOrderAction } from "@/app/_actions/sales";
import { toast } from "sonner";
import { dispatchSlice, updateSlice } from "@/store/slicers";
import { useBool } from "@/lib/use-loader";
import { Icons } from "../icons";
import { store } from "@/store";
import {
  adminCompleteProductionAction,
  cancelProductionAssignmentAction,
} from "@/app/_actions/sales-production";
import { openModal } from "@/lib/modal";
import { EmailModalProps } from "@/types/email";

export interface IOrderRowProps {
  row: ISalesOrder;
  viewMode?: Boolean;
  estimate?: Boolean;
  print?(mode: IOrderType | "production");
  myProd?: Boolean;
}
export function OrderRowAction(props: IOrderRowProps) {
  const { row, viewMode, estimate } = props;
  const _linkDir = `/sales/${row.type}/${row.slug}`;
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
          <DropdownMenuItem
            onClick={() => {
              console.log(row);
              openModal<EmailModalProps>("email", {
                type: "sales",
                parentId: row.id,
                toName: row.customer?.name,
                toEmail: row.customer?.email,
                from: "GND Millwork<sales@gndprodesk.com>",
                data: row,
              });
            }}
          >
            <MessageSquarePlus className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Email
          </DropdownMenuItem>
          <ProductionAction row={row} />
          <CopyOrderMenuAction row={row} />
          <PrintOrderMenuAction row={row} />
          <DeleteRowMenuAction row={row} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
export const DeleteRowMenuAction = typedMemo(({ row }: IOrderRowProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const confirm = useBool();
  async function deleteOrder(e) {
    e.preventDefault();
    if (!confirm.bool) {
      confirm.setBool(true);
      setTimeout(() => {
        confirm.setBool(false);
      }, 3000);
      return;
    }
    confirm.setBool(false);
    startTransition(async () => {
      toast.promise(
        async () => {
          await deleteOrderAction(row.id);
          router.refresh();
        },
        {
          loading: `Deleteting ${row.type} #${row.orderId}`,
          success(data) {
            return "Deleted Successfully";
          },
          error: "Unable to completed Delete Action",
        }
      );
    });
  }

  const Icon = confirm.bool ? Info : isPending ? Icons.spinner : Trash;
  return (
    <DropdownMenuItem
      disabled={isPending}
      className="text-red-500 hover:text-red-600"
      onClick={deleteOrder}
    >
      <Icon
        className={`mr-2 ${isPending ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4"}`}
      />
      {confirm.bool ? "Sure?" : isPending ? "Deleting" : "Delete"}
      <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
    </DropdownMenuItem>
  );
});
export const PrintOrderMenuAction = typedMemo((props: IOrderRowProps) => {
  function _print(mode: IOrderPrintMode) {
    dispatchSlice("printOrders", {
      mode,
      slugs: [props.row.slug],
    });
  }
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Printer className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Print
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {!props.myProd && (
          <>
            <DropdownMenuItem
              onClick={() => {
                _print("quote");
              }}
            >
              <Banknote className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Estimates
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                _print("order");
              }}
            >
              <ShoppingBag className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Order
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem
          onClick={() => {
            _print("production");
          }}
        >
          <Construction className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Production
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
});
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
export const ProductionAction = typedMemo(({ row }: IOrderRowProps) => {
  const assignProduction = useCallback(() => {
    const { id, orderId, prodDueDate, prodId } = row;
    openModal("assignProduction", { id, orderId, prodDueDate, prodId });
    // store.dispatch(
    //   updateSlice({
    //     key: "assignProduction",
    //     data: { id, orderId, prodDueDate, prodId },
    //   })
    // );
  }, [row]);
  const router = useRouter();

  async function _clearAssignment() {
    await cancelProductionAssignmentAction(row.id);
    router.refresh();
    toast.success("Production Assignment Cancelled");
  }
  async function completeProduction() {
    await adminCompleteProductionAction(row.id);
    router.refresh();
    toast.success("Production Completed");
  }
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ListOrderedIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Production
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem className="" asChild>
          <Link
            href={`/sales/productions/${row.orderId}`}
            className="flex w-full"
          >
            <BookOpen className={`mr-2 h-4 w-4`} />
            <span>Open</span>
          </Link>
        </DropdownMenuItem>
        {row.prodStatus == "Completed" ? (
          <>
            <DropdownMenuItem onClick={() => {}}>
              <FlagIcon className={`mr-2 h-4 w-4`} />
              <span>Incomplete</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={assignProduction}>
              <FlagIcon className={`mr-2 h-4 w-4`} />
              <span>{row.prodId ? "Update Assignment" : "Assign"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={_clearAssignment}>
              <X className={`mr-2 h-4 w-4`} />
              <span>Clear Assign</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={completeProduction}>
              <Check className={`mr-2 h-4 w-4`} />
              <span>Mark as Completed</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
});
