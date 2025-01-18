import ConfirmBtn from "@/components/_v1/confirm-btn";
import { salesOverviewStore } from "../store";
import { Icons } from "@/components/_v1/icons";
import {
    deleteSalesUseCase,
    restoreDeleteUseCase,
} from "../../../use-case/sales-use-case";
import { toast } from "sonner";
import { Menu } from "@/components/(clean-code)/menu";
import { PrintMenuAction } from "./print.menu.action";
import { MoveMenuAction } from "./move.menu.action";
import { CopyMenuAction } from "./copy.menu.action";
import { Button } from "@/components/ui/button";
import Money from "@/components/_v1/money";
import { openTxForm } from "../../tx-form";

export function Footer({}) {
    const store = salesOverviewStore();
    return (
        <div className="flex gap-4 py-2 border-t w-full">
            <div className="flex-1"></div>
            <ConfirmBtn
                size="icon"
                Icon={Icons.trash}
                onClick={async () => {
                    const id = store?.salesId;
                    await deleteSalesUseCase(id);
                    // ctx.refreshList?.();
                    toast("Deleted", {
                        action: {
                            label: "Undo",
                            onClick: async () => {
                                await restoreDeleteUseCase(id);
                                // ctx.refreshList?.();
                            },
                        },
                    });
                    // ctx.closeModal();
                }}
                trash
                variant="destructive"
            />
            {store.adminMode && (
                <>
                    <Button
                        onClick={() => {
                            if (!store.overview?.phoneNo)
                                toast.error("Payment requires phone number.");
                            else
                                openTxForm({
                                    phoneNo: store.overview?.phoneNo,
                                    paymentMethod: "terminal",
                                    payables: [
                                        {
                                            amountDue: store.overview.due,
                                            id: store.overview.id,
                                            orderId: store.overview.orderId,
                                        },
                                    ],
                                });
                        }}
                        size="xs"
                        disabled={!store.overview?.due}
                    >
                        <Icons.dollar className="size-4 mr-2" />
                        <Money value={store.overview?.due}></Money>
                    </Button>
                </>
            )}
            <Menu variant="outline">
                <PrintMenuAction />
                <PrintMenuAction pdf />
                <CopyMenuAction />
                <MoveMenuAction />
            </Menu>
        </div>
    );
}
