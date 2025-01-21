import { useForm } from "react-hook-form";
import { salesOverviewStore } from "../../store";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import FormSelect from "@/components/common/controls/form-select";
import { dispatchModes } from "../../../../utils/contants";
import {
    DeliveryOption,
    QtyControlByType,
    QtyControlType,
} from "@/app/(clean-code)/(sales)/types";
import Button from "@/components/common/button";
import Portal from "@/components/_v1/portal";
import { GetSalesItemOverviewAction } from "../../../../data-actions/sales-items-action";
import { Menu } from "@/components/(clean-code)/menu";
import { sum } from "@/lib/utils";

type Shippable = {
    item: GetSalesItemOverviewAction["items"][number];
};
type ItemShippable = {
    pendingAssignmentQty?: number;
    pendingProductionQty?: number;
    deliveryCreatedQty?: number;
    pendingDeliveryQty?: number;
    deliverableQty?: number;
    qty?: number;
    inputs: {
        label: string;
        available: number;
        total: number;
        delivered: number;
        unavailable: number;
        formKey: string;
    }[];
};
type SelectionType = { [uid in string]: Partial<QtyControlByType["qty"]> };
export function SalesShippingForm({}) {
    const store = salesOverviewStore();
    const shipping = store.shipping;
    const itemView = store.itemOverview;
    const [shippables, setShippables] = useState<Shippable[]>([]);
    const form = useForm({
        defaultValues: {
            dispatchMode: "" as DeliveryOption,
            assignedToId: "",
            selection: {} as SelectionType,
            loaded: false,
        },
    });
    const [loaded] = form.watch(["loaded"]);
    useEffect(() => {
        const selection: SelectionType = {};
        itemView?.items?.map((k) => {
            selection[k.itemControlUid] = {
                itemControlUid: k.itemControlUid,
                lh: 0,
                rh: 0,
                total: 0,
                qty: 0,
            };
        });
        form.reset({
            selection,
        });
    }, [itemView]);
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
                        <div className="flex-1">
                            <FormSelect
                                size="xs"
                                className=""
                                options={dispatchModes}
                                control={form.control}
                                name="dispatchMode"
                                placeholder={"Assigned To"}
                            />
                        </div>
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
    const status = item.status;
    const [shipInfo, setShipInfo] = useState<ItemShippable>({} as any);
    useEffect(() => {
        // console.log(item?.status);
        let shipping: ItemShippable = {
            inputs: [],
            deliveryCreatedQty: 0,
            pendingAssignmentQty: 0,
            pendingDeliveryQty: 0,
            deliverableQty: 0,
            pendingProductionQty: 0,
            qty: 0,
        };

        function qtyShip(k: "lh" | "rh" | "qty") {
            function getValue(fromStatus: keyof typeof status) {
                return status?.[fromStatus]?.[k] || 0;
            }
            function getValues(fromStatus: (keyof typeof status)[]) {
                return fromStatus?.map((a) => getValue(a));
            }
            let shippedQty = sum(
                getValues([
                    "dispatchAssigned",
                    "dispatchCompleted",
                    "dispatchInProgress",
                ])
            );
            let totalQty = getValue("qty");
            let producedQty = getValue("prodCompleted");
            let assignProdQty = getValue("prodAssigned");
            shipping.deliveryCreatedQty += shippedQty;
            shipping.qty += totalQty;
            shipping.pendingAssignmentQty += sum([
                totalQty,
                -1 * assignProdQty,
            ]);
            const pendingDelivery = sum([totalQty, -1 * shippedQty]);
            shipping.pendingDeliveryQty += pendingDelivery;
            shipping.pendingProductionQty += sum([
                assignProdQty,
                -1 * producedQty,
            ]);
            const deliverable = sum([producedQty, -1 * shippedQty]);
            shipping.deliverableQty += deliverable;
            shipping.inputs.push({
                delivered: shippedQty,
                available: deliverable,
                unavailable: sum([pendingDelivery, -1 * deliverable]),
                formKey: k,
                label: k,
                total: deliverable,
                // available: deliverableQty,
            });
        }
        qtyShip("lh");
        qtyShip("rh");
        qtyShip("qty");
        setShipInfo(shipping);
    }, []);
    return (
        <div className="border-b">
            <div className="flex">
                <div className="flex-1 cursor-pointer">
                    <div className="text-sm font-semibold">{item?.title}</div>
                    <div className="uppercase text-muted-foreground text-xs font-bold space-x-2">
                        <span>{item.sectionTitle}</span>
                    </div>
                </div>
                <div className="">
                    {shipInfo?.inputs?.map((input) => (
                        <div>{input.available}</div>
                    ))}
                </div>
                <div className="">
                    <Menu>
                        <Menu.Item>Submit All Pending</Menu.Item>
                        <Menu.Item>Mark All as Completed</Menu.Item>
                    </Menu>
                </div>
            </div>
        </div>
    );
}
