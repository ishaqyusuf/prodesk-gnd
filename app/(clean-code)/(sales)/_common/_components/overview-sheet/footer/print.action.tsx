import { SalesType } from "@/app/(clean-code)/(sales)/types";
import { useSalesOverview } from "../overview-provider";
import { Menu } from "@/components/(clean-code)/menu";
import { Move } from "lucide-react";
import { openLink } from "@/lib/open-link";
import { SalesPrintProps } from "@/app/(v2)/printer/sales/page";

export function PrintAction({}) {
    const ctx = useSalesOverview();
    const dispatchList = ctx.item.dispatchList;
    const type = ctx.item.type;
    function print(params?: SalesPrintProps["searchParams"]) {
        openLink(
            `/printer/sales`,
            {
                slugs: ctx.item?.slug,
                mode: type,
                preview: false,
                ...(params || {}),
            } as SalesPrintProps["searchParams"],
            true
        );
    }
    if (type == "quote") return;
    <Menu.Item
        icon="print"
        onClick={() => {
            print();
        }}
    >
        Print
    </Menu.Item>;
    return (
        <Menu.Item
            icon="print"
            SubMenu={
                <>
                    <Menu.Item
                        SubMenu={
                            dispatchList?.length == 0 ? null : (
                                <>
                                    <Menu.Item onClick={() => {}}>
                                        Print All
                                    </Menu.Item>
                                    {dispatchList.map((d) => (
                                        <Menu.Item
                                            key={d.id}
                                            onClick={() => {}}
                                        >
                                            {d.title}
                                        </Menu.Item>
                                    ))}
                                </>
                            )
                        }
                        icon="packingList"
                        disabled={dispatchList?.length == 0}
                    >
                        Packing List
                    </Menu.Item>
                    <Menu.Item
                        icon="orders"
                        onClick={() => {
                            print();
                        }}
                    >
                        Order
                    </Menu.Item>
                    <Menu.Item
                        icon="production"
                        onClick={() => {
                            print({
                                mode: "production",
                            });
                        }}
                    >
                        Production
                    </Menu.Item>
                </>
            }
        >
            Print
        </Menu.Item>
    );
}
