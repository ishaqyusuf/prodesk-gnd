import { SalesType } from "@/app/(clean-code)/(sales)/types";
import { useSalesOverview } from "../overview-provider";
import { Menu } from "@/components/(clean-code)/menu";
import { Move } from "lucide-react";
import { openLink } from "@/lib/open-link";

export function PrintAction({}) {
    const ctx = useSalesOverview();
    const dispatchList = ctx.item.dispatchList;
    const type = ctx.item.type;
    if (type == "quote") return;
    <Menu.Item
        icon="print"
        onClick={() => {
            openLink(
                `/printer/sales`,
                {
                    slugs: ctx.item?.slug,
                    mode: type,
                    preview: false,
                },
                true
            );
        }}
    >
        Print
    </Menu.Item>;
    return (
        <Menu.Item
            icon="print"
            SubMenu={
                <>
                    <Menu.Item disabled={dispatchList?.length == 0}>
                        Packing List
                    </Menu.Item>
                </>
            }
        >
            Print
        </Menu.Item>
    );
}
