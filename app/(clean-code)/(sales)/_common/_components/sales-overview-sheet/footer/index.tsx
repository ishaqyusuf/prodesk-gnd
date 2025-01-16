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
            <Menu variant="outline">
                <PrintMenuAction />
                <PrintMenuAction pdf />
                <CopyMenuAction />
                <MoveMenuAction />
            </Menu>
        </div>
    );
}
