import { SecondaryTabSheet } from "@/components/(clean-code)/data-table/item-overview-sheet";
import { useItemProdViewContext } from "../production/use-hooks";

import { createContext } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

import Button from "@/components/common/button";

import { Icons } from "@/components/_v1/icons";
import { toast } from "sonner";
import { qtyDiff } from "../../../data-access/dto/sales-item-dto";
import Badge from "../components/badge";

let context = null;
type Ctx = ReturnType<typeof useShippingFormCtx>;
const useShippingForm = (): Ctx => {
    const ctx = useItemProdViewContext();
    const { mainCtx, item, payload } = ctx;
    const slug = mainCtx.tabData?.payloadSlug;
    // if (context?.id == slug) return context;
    return useShippingFormCtx(ctx);
};
const useShippingFormCtx = (ctx: ReturnType<typeof useItemProdViewContext>) => {
    // const ctx = useItemProdViewContext();
    // if (_) return _;
    if (context) return context as typeof resp;
    const { mainCtx, item, payload } = ctx;
    const slug = mainCtx.tabData?.payloadSlug;
    const shippingOverview = mainCtx.overview?.shipping;
    const shipping = mainCtx.overview?.shipping?.list?.find(
        (ls) => ls.id == slug
    );
    if (!shipping) {
        toast.error("Shipping not found");
        mainCtx.closeSecondaryTab();
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
    const { mainCtx, shipping } = ctx;
    return (
        <ShippingFormCtx.Provider value={ctx}>
            <div className="secondary-tab flex flex-col">
                <SecondaryTabSheet
                    title={shipping.title}
                    onBack={() => mainCtx.setTabData(null)}
                >
                    <Button size="sm" className="h-8">
                        <Icons.print className="w-4 h-4 mr-2" />
                        <span>Print</span>
                    </Button>
                </SecondaryTabSheet>
                <ScrollArea className="w-[600px] h-[80vh] flex flex-col">
                    <div className="p-4 sm:p-8">
                        {ctx.items?.map(({ item, qty, deliveries }, index) => (
                            <div key={index}>
                                <div className="">{item.title}</div>
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
