"use client";
import Btn from "@/components/btn";
import { ToolTip } from "@/components/tool-tip";
import { useAppSelector } from "@/store";
import { CheckCircle, Play, StopCircle, Undo } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState, useTransition } from "react";
import { ISalesOrderItem, ProdActions } from "@/types/sales";
import { orderItemProductionAction } from "@/app/_actions/sales-production";
import { openModal } from "@/lib/modal";
import { toast } from "sonner";
interface IProp {
  item: ISalesOrderItem;
}
export const ProdItemActions = ({ item }: IProp) => {
  const [order, isProd] = useAppSelector((state) => [
    state.slicers.order,
    state.slicers.orderProdView,
  ]);
  const {
    qty,
    meta: { produced_qty },
  } = item;
  const [prodState, setProdState] = useState<
    "Started" | "Completed" | "Pending"
  >("Pending");
  const [ls, setLs] = useState<ProdActions>();
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();
  const __action = useCallback(
    async (action: ProdActions) => {
      setLs(action);
      await orderItemProductionAction({
        itemId: item.id,
        action,
      });
      setLs(null as any);
      router.refresh();
      toast.success("Success");
    },
    [item, router]
  );
  useEffect(() => {
    // console.log(qty, produced_qty);
    if (qty == produced_qty) setProdState("Completed");
    if (produced_qty == 0 || (qty as any) > produced_qty)
      setProdState("Started");
    if (!produced_qty && produced_qty != 0) setProdState("Pending");
  }, [qty, produced_qty, setProdState]);
  return (
    <div className="flex items-end space-x-2">
      {prodState != "Pending" && (
        <ToolTip info="Cancel Production">
          <Btn
            icon
            onClick={() => __action("Stop")}
            isLoading={ls == "Stop"}
            className="h-8  w-8 bg-red-500 p-0"
          >
            <StopCircle className="h-4 w-4" />
          </Btn>
        </ToolTip>
      )}
      {produced_qty > 0 && (
        <ToolTip info="Reverse Production">
          <Btn
            icon
            onClick={() => {
              openModal("prodItemUpdate", {
                item,
                action: "Cancel",
              });
            }}
            isLoading={ls == "Cancel"}
            className="h-8  w-8 bg-orange-500 p-0"
          >
            <Undo className="h-4 w-4" />
          </Btn>
        </ToolTip>
      )}

      {prodState == "Started" && (
        <ToolTip info="Submit Production">
          <Btn
            icon
            onClick={() => {
              openModal("prodItemUpdate", {
                item,
                action: "Complete",
              });
            }}
            isLoading={ls == "Complete"}
            className="h-8  w-8 bg-green-500 p-0"
          >
            <CheckCircle className="h-4 w-4" />
          </Btn>
        </ToolTip>
      )}
      {prodState == "Pending" && (
        <ToolTip info="Start Production">
          <Btn
            icon
            onClick={() => __action("Start")}
            isLoading={ls == "Start"}
            className="h-8 w-8  p-0"
            variant="default"
          >
            <Play className="h-4 w-4" />
          </Btn>
        </ToolTip>
      )}
    </div>
  );
};
