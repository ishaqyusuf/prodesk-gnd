import { Menu } from "@/components/(clean-code)/menu";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import { useSalesOverview } from "./overview-provider";
import { toast } from "sonner";

export default function ActionFooter({}) {
    const ctx = useSalesOverview();
    return (
        <div className="absolute flex gap-4 bottom-0 px-4 py-2 bg-white border-t sbg-muted w-full shadow-sm">
            <div className="flex-1"></div>
            <Button size="sm" className="bg-green-600">
                <Icons.dollar className="w-4 h-4 mr-2" />
                Pay
            </Button>
            <ConfirmBtn
                size="sm"
                Icon={Icons.trash}
                trash
                variant="destructive"
            >
                Delete
            </ConfirmBtn>
            <Menu variant="outline">
                <Menu.Item
                    SubMenu={
                        <>
                            <Menu.Item>Item Sub 1</Menu.Item>
                        </>
                    }
                >
                    Item 1
                </Menu.Item>
                <Menu.Item>Item 2</Menu.Item>
                <Menu.Item
                    onClick={() => {
                        ctx.refresh().then((r) => {
                            toast.success("Refreshed");
                        });
                    }}
                >
                    Refresh
                </Menu.Item>
            </Menu>
        </div>
    );
}
