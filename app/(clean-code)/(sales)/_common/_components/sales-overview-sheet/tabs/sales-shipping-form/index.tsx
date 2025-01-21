import { useForm } from "react-hook-form";
import { salesOverviewStore } from "../../store";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import FormSelect from "@/components/common/controls/form-select";
import { dispatchModes } from "../../../../utils/contants";
import { DeliveryOption } from "@/app/(clean-code)/(sales)/types";
import Button from "@/components/common/button";
import Portal from "@/components/_v1/portal";
import { GetSalesItemOverviewAction } from "../../../../data-actions/sales-items-action";

type Shippable = {
    item: GetSalesItemOverviewAction["items"][number];
};
export function SalesShippingForm({}) {
    const store = salesOverviewStore();
    const shipping = store.shipping;
    const itemView = store.itemOverview;
    const [shippables, setShippables] = useState<Shippable[]>([]);
    const form = useForm({
        defaultValues: {
            dispatchMode: "" as DeliveryOption,
        },
    });

    if (!itemView) return null;
    return (
        <Form {...form}>
            <div className="">
                <Portal nodeId={"tabHeader"}>
                    <div className="flex items-center py-2 border-b gap-4">
                        <div className="flex-1">
                            <FormSelect
                                size="xs"
                                className=""
                                options={dispatchModes}
                                control={form.control}
                                name="dispatchMode"
                                placeholder={"Dispatch Mode"}
                            />
                        </div>
                        <div className="flex-1"></div>
                        <Button variant="secondary" className="">
                            Select All Available
                        </Button>
                        <Button className="">Save</Button>
                    </div>
                </Portal>
                {itemView?.items?.map((item, uid) => (
                    <ShippingItem key={uid} item={item} />
                ))}
            </div>
        </Form>
    );
}
function ShippingItem({ item }: { item: Shippable["item"] }) {
    return (
        <div className="border-b py-2">
            <div className="text-sm font-semibold text-muted-foreground">
                {item?.title}
            </div>
            <div className=""></div>
        </div>
    );
}
