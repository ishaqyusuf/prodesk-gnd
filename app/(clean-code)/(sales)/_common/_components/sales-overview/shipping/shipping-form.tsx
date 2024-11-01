import { SecondaryTabSheet } from "@/components/(clean-code)/data-table/item-overview-sheet";
import {
    ItemProdViewContext,
    useItemProdViewContext,
} from "../production/use-hooks";
import { Badge } from "@/components/ui/badge";
import { GetSalesOverview } from "../../../use-case/sales-item-use-case";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { createContext, useContext, useEffect } from "react";
import { Form } from "@/components/ui/form";
import NumberPicker from "@/components/(clean-code)/custom/controlled/number-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    SalesDispatchForm,
    salesDispatchFormUseCase,
} from "../../../use-case/sales-dispatch-use-case";
import { cn } from "@/lib/utils";

const useShippingFormCtx = () => {
    const ctx = useItemProdViewContext();
    const { mainCtx, item } = ctx;
    const form = useForm<SalesDispatchForm>({
        defaultValues: {},
    });
    useEffect(() => {
        salesDispatchFormUseCase(mainCtx.overview?.shipping).then((resp) => {
            form.reset(resp);
        });
    }, []);

    return {
        mainCtx,
        form,
        item,
        dispatchables: mainCtx.overview?.shipping?.dispatchableItemList,
    };
};
const ShippingFormCtx = createContext<ReturnType<typeof useShippingFormCtx>>(
    null as any
);

export function ShippingForm({}) {
    const ctx = useShippingFormCtx();
    const { mainCtx, form, dispatchables } = ctx;
    const watchToggle = form.watch("toggleAll");
    function toggleAllAvailble() {
        const sels = {};
        if (!watchToggle) {
            dispatchables
                ?.filter((d) => d.deliverable)
                .map((d) => {
                    sels[d.uid] = {
                        selected: true,
                        available: d.deliverable,
                    };
                });
        }
        form.setValue("selection", sels);
        form.setValue("toggleAll", !watchToggle);
    }
    return (
        <ShippingFormCtx.Provider value={ctx}>
            <SecondaryTabSheet
                title="Create Shipping"
                onBack={() => mainCtx.setTabData(null)}
            ></SecondaryTabSheet>
            <div className="border-b flex p-4 gap-4">
                <div className="flex-1"></div>
                <Button
                    onClick={toggleAllAvailble}
                    size="sm"
                    variant={watchToggle ? "secondary" : "ghost"}
                >
                    Mark All Available
                </Button>
                <Button size="sm">Create</Button>
            </div>
            <ScrollArea className="w-[600px] h-[80vh] flex flex-col">
                <div className="p-4 sm:p-8">
                    <Form {...form}>
                        {dispatchables?.map((item) => (
                            <ShippingItemLine item={item} key={item.id} />
                        ))}
                    </Form>
                </div>
            </ScrollArea>
        </ShippingFormCtx.Provider>
    );
}
function ShippingItemLine({
    item,
}: {
    item: GetSalesOverview["shipping"]["dispatchableItemList"][number];
}) {
    const ctx = useContext(ShippingFormCtx);
    const { form } = ctx;
    const itemForm = form.watch(`selection.${item.uid}`);
    const deliverableQty = item.deliverableQty;
    const pending = item.analytics.pending;
    return (
        <div className="flex flex-col border-b">
            <Button
                className="flex-1 h-auto"
                variant={itemForm?.selected ? "secondary" : "ghost"}
                onClick={() => {
                    const val = !itemForm?.selected;
                    form.setValue(`selection.${item.uid}.selected`, val);
                    if (val && !itemForm?.available) {
                        form.setValue(
                            `selection.${item.uid}.available`,
                            deliverableQty
                        );
                    }
                }}
            >
                <div className="flex w-full justify-start text-start">
                    <div className="flex-col space-y-2">
                        <span className="text-sm">{item.title}</span>
                        <div>
                            <Badge variant="secondary" className="font-mono">
                                Delivered: {item.totalDelivered}
                            </Badge>
                            <Badge variant="secondary" className="font-mono">
                                Pending: {item.pendingDelivery}
                            </Badge>
                            <Badge variant="secondary" className="font-mono">
                                Available: {item.deliverable}
                            </Badge>
                        </div>
                    </div>
                </div>
            </Button>
            {itemForm?.selected && (
                <div>
                    {/* {JSON.stringify(item.analytics)} */}
                    <div
                        className={cn(
                            deliverableQty.lh &&
                                deliverableQty.rh &&
                                "grid grid-cols-2 gap-4"
                        )}
                    >
                        {deliverableQty.lh || deliverableQty.qty ? (
                            <NumberPicker
                                label={`Delivery Qty ${
                                    item.hasSwing ? "(LH)" : ""
                                }`}
                                size="sm"
                                control={form.control}
                                name={`selection.${item.uid}.available.${
                                    item.hasSwing ? "lh" : "qty"
                                }`}
                                length={deliverableQty.lh || deliverableQty.qty}
                            />
                        ) : (
                            <></>
                        )}
                        {deliverableQty.rh ? (
                            <NumberPicker
                                label={`Delivery Qty ${
                                    item.hasSwing && "(RH)"
                                }`}
                                size="sm"
                                control={form.control}
                                name={`selection.${item.uid}.available.rh`}
                                length={deliverableQty.rh}
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
