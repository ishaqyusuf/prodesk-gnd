import { Menu } from "@/components/(clean-code)/menu";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { Icons } from "@/components/_v1/icons";
import { useSalesOverview } from "../overview-provider";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { CopyAction } from "./copy.action";
import { deleteSalesUseCase } from "../../../use-case/sales-use-case";
import { MoveAction } from "./move.action";
import { PrintAction } from "./print.action";
import { PayAction } from "./pay.action";

export default function ActionFooter({}) {
    const ctx = useSalesOverview();
    return (
        <div className="absolute flex gap-4 bottom-0 px-4 py-2 bg-white border-t sbg-muted w-full shadow-sm">
            <div className="flex-1"></div>
            <PayAction />
            <ConfirmBtn
                size="xs"
                Icon={Icons.trash}
                onClick={async () => {
                    await deleteSalesUseCase(ctx.item.id);
                }}
                trash
                variant="destructive"
            >
                Delete
            </ConfirmBtn>
            <Menu variant="outline">
                <PrintAction />
                <Menu.Item
                    Icon={RefreshCcw}
                    onClick={() => {
                        ctx.refresh().then((r) => {
                            toast.success("Refreshed");
                        });
                    }}
                >
                    Refresh
                </Menu.Item>
                <CopyAction />
                <MoveAction />
            </Menu>
        </div>
    );
}
