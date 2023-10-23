"use client";
import Btn from "@/components/btn";
import { ToolTip } from "@/components/tool-tip";
import { CheckCircle, Play, StopCircle, Undo } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState, useTransition } from "react";
import { ISalesOrder, ISalesOrderItem, ProdActions } from "@/types/sales";
import { orderItemProductionAction } from "@/app/_actions/sales/sales-production";
import { openModal } from "@/lib/modal";
import { toast } from "sonner";
import { useAppSelector } from "@/store";
import { _cancelSalesPickup } from "@/app/_actions/sales/_sales-pickup";
interface IProp {
    item: ISalesOrder;
}
export const PickupAction = ({ item }: IProp) => {
    const [isPending, startTransition] = useTransition();

    return (
        <div className="flex items-end space-x-2">
            {!item.pickup ? (
                <ToolTip info="Submit Production">
                    <Btn
                        icon
                        onClick={() => {
                            openModal("pickup", { order: item });
                        }}
                        isLoading={isPending}
                        className="h-8  w-8 bg-green-500 p-0"
                    >
                        <CheckCircle className="h-4 w-4" />
                    </Btn>
                </ToolTip>
            ) : (
                <ToolTip info="Reverse Production">
                    <Btn
                        icon
                        onClick={async () => {
                            startTransition(async () => {
                                await _cancelSalesPickup(item.id);
                                toast.success("Pickup cancelled");
                            });
                        }}
                        isLoading={isPending}
                        className="h-8  w-8 bg-red-500 p-0"
                    >
                        <Undo className="h-4 w-4" />
                    </Btn>
                </ToolTip>
            )}
        </div>
    );
};
