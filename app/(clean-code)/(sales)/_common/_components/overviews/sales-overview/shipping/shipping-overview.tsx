import { SecondaryTabSheet } from "@/components/(clean-code)/data-table/item-overview-sheet";
import { useItemProdViewContext } from "../production/use-hooks";

import { createContext } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Icons } from "@/components/_v1/icons";
import { toast } from "sonner";
import { qtyDiff } from "../../../../data-access/dto/sales-item-dto";
import Badge from "../components/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

let context = null;
type Ctx = ReturnType<typeof useShippingFormCtx>;
const useShippingForm = (): Ctx => {
    const ctx = useItemProdViewContext();

    return useShippingFormCtx(ctx);
};
const useShippingFormCtx = (ctx: ReturnType<typeof useItemProdViewContext>) => {
    // const ctx = useItemProdViewContext();
    // if (_) return _;
    if (context?.id == ctx?.mainCtx?.tabData?.payloadSlug)
        return context as typeof resp;
    const { mainCtx, item, payload } = ctx;
    const slug = mainCtx.tabData?.payloadSlug;
    const shippingOverview = mainCtx.overview?.shipping;
    const shipping = mainCtx.overview?.shipping?.list?.find(
        (ls) => ls.id == slug
    );
    if (!shipping) {
        toast.error("Shipping not found");
        mainCtx.closeSecondaryTab();
        context = null;
        return null;
    }
    let items = shippingOverview.dispatchableItemList
        .map((item) => {
            const deliveries = shipping.items.filter(
                (i) => i.itemId == item.id
            );
            const [d1, d2, ...rest] = deliveries;
            let qty = d2 ? qtyDiff(d1.qty, d2.qty, true) : d1?.qty;
            rest?.map((r) => {
                qty = qtyDiff(qty, r.qty, true);
            });
            return {
                item,
                deliveries,
                qty,
            };
        })
        .filter((data) => data.qty?.total);
    const resp = {
        shipping,
        items,
        id: slug,
        mainCtx,
    };
    context = resp;
    return resp;
};
const ShippingFormCtx = createContext<ReturnType<typeof useShippingFormCtx>>(
    null as any
);

export function ShippingOverview({}) {
    const ctx = useShippingForm();
    if (!ctx || !ctx?.shipping?.id) return null;
    const { mainCtx, shipping } = ctx;
    return (
        <ShippingFormCtx.Provider value={ctx}>
            <div className="secondary-tab flex flex-col">
                <SecondaryTabSheet
                    title={shipping.title}
                    onBack={() => {
                        mainCtx.closeSecondaryTab();
                        context = null;
                    }}
                >
                    <Button asChild size="sm" className="h-8">
                        <Link
                            href={`/printer/sales?slugs=${mainCtx.overview.orderId}&mode=packing list&dispatchId=${shipping.id}`}
                            target="_blank"
                        >
                            <Icons.print className="w-4 h-4 mr-2" />
                            <span>Print</span>
                        </Link>
                    </Button>
                </SecondaryTabSheet>
                <ScrollArea
                    // className="w-[600px] h-[80vh] flex flex-col"
                    className="o-scrollable-content-area"
                >
                    <div className="p-4 sm:p-8">
                        {ctx.items?.map(({ item, qty, deliveries }, index) => (
                            <div
                                className="border-b p-2 bg-white rounded"
                                key={index}
                            >
                                <div className="flex">
                                    <span className="text-sm font-semibold">
                                        {item.title}{" "}
                                    </span>
                                    <div className="flex-1"></div>
                                    <Badge
                                        value={item.swing}
                                        variant="secondary"
                                    />
                                    <Badge
                                        value={item.size}
                                        variant="secondary"
                                    />
                                </div>
                                <div>
                                    {qty.rh || qty.lh ? (
                                        <>
                                            <Badge
                                                variant="secondary"
                                                suffix="RH"
                                                value={qty.rh}
                                            />
                                            <Badge
                                                variant="secondary"
                                                suffix="LH"
                                                value={qty.lh}
                                            />
                                        </>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            prefix="Qty"
                                            value={qty.qty}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </ShippingFormCtx.Provider>
    );
}
