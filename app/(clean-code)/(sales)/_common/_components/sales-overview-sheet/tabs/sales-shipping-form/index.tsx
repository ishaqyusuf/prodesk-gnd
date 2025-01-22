import { useForm, useFormContext } from "react-hook-form";
import { salesOverviewStore } from "../../store";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import FormSelect from "@/components/common/controls/form-select";
import { dispatchModes } from "../../../../utils/contants";
import {
    DeliveryOption,
    QtyControlByType,
} from "@/app/(clean-code)/(sales)/types";
import Button from "@/components/common/button";
import Portal from "@/components/_v1/portal";
import { GetSalesItemOverviewAction } from "../../../../data-actions/sales-items-action";
import { Menu } from "@/components/(clean-code)/menu";
import { cn, sum } from "@/lib/utils";
import FormInput from "@/components/common/controls/form-input";
import { CheckCircle } from "lucide-react";
import ProgressStatus from "@/components/_v1/progress-status";
import FStatusBadge from "@/components/(clean-code)/fikr-ui/f-status-badge";
import Badge from "../../../overview-sheet/components/badge";

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
type SelectionType = {
    [uid in string]: Partial<QtyControlByType["qty"]> & {
        selectionError?: boolean;
    };
};
export function SalesShippingForm({}) {
    const store = salesOverviewStore();
    const itemView = store.itemOverview;
    const form = useForm({
        defaultValues: {
            dispatchMode: "" as DeliveryOption,
            assignedToId: "",
            selection: {} as SelectionType,
            loaded: false,
            markAll: false,
            totalSelected: 0,
            selectionError: false,
        },
    });
    const [loaded, markAll, totalSelected, selectionError] = form.watch([
        "loaded",
        "markAll",
        "totalSelected",
        "selectionError",
    ]);
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
    function selectAllAvailable() {}
    async function createShipping() {
        const data = form.getValues();
    }
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
                                options={store.dispatchUsers}
                                titleKey="name"
                                valueKey="id"
                                control={form.control}
                                name="assignedToId"
                                placeholder={"Assigned To"}
                            />
                        </div>
                        <Button
                            disabled={!totalSelected || selectionError}
                            variant="secondary"
                            className=""
                        >
                            Select All Available
                        </Button>
                        <Button onClick={createShipping} className="">
                            Save
                        </Button>
                    </div>
                </Portal>
                {itemView?.items
                    ?.filter((a) => !a.hidden)
                    .map((item, uid) => (
                        <ShippingItem key={uid} item={item} />
                    ))}
            </div>
        </Form>
    );
}
function ShippingItem({ item }: { item: Shippable["item"] }) {
    const status = item.status;

    const uid = item.itemControlUid;
    const form = useFormContext();
    const [lh, rh, qty, total] = form.watch([
        `${uid}.lh`,
        `${uid}.rh`,
        `${uid}.qty`,
        `${uid}.total`,
    ]);
    const [shipInfo, setShipInfo] = useState<ItemShippable>({} as any);
    // const totalShippables=  useMemo(() => {
    //     return sum(shipInfo.deliveryCreatedQty)
    // },[shipInfo])
    useEffect(() => {
        const _total = sum([lh, rh, qty]);
        const deliverableQty = shipInfo.deliverableQty;
        form.setValue(`${uid}.total`, _total);
    }, [lh, rh, qty, shipInfo]);
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
                // status.prodAssigned?.autoComplete
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
            console.log({ assignProdQty });

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
        console.log({ shipping });

        setShipInfo(shipping);
    }, []);
    return (
        <div className={cn("border-b px-4 py-2", total > 0 && "bg-green-50")}>
            <div className="flex gap-4">
                <div className="">
                    <CheckCircle
                        className={cn(
                            "size-4",
                            total > 0 ? "text-green-500" : "opacity-0"
                        )}
                    />
                </div>
                <div className="space-y-2  flex-1">
                    <div className="flex-1 cursor-pointer">
                        <div className="uppercase text-muted-foreground text-sm font-normal space-x-2">
                            <span>{item.sectionTitle}</span>
                            <span>{item.subtitle}</span>
                            <span>{item.swing}</span>
                        </div>
                        <div className="text-sm uppercase font-semibold">
                            {item?.title}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {shipInfo?.inputs?.filter((a) => a.available)
                            ?.length ? null : (
                            <>
                                {/* {!shipInfo.deliveryCreatedQty || ( */}
                                <ProgressStatus
                                    noDot
                                    color={"blue"}
                                    status={`${shipInfo.deliveryCreatedQty}/${shipInfo.qty} item shipped`}
                                />
                                {/* )} */}
                                {!shipInfo.pendingAssignmentQty || (
                                    <ProgressStatus
                                        color={"red"}
                                        noDot
                                        status={`${shipInfo.pendingAssignmentQty} not assigned`}
                                    />
                                )}
                                {!shipInfo.pendingProductionQty || (
                                    <ProgressStatus
                                        color={"orange"}
                                        noDot
                                        status={`${shipInfo.pendingProductionQty} pending production`}
                                    />
                                )}
                                {/* {shipInfo. && (
                                    <ProgressStatus
                                        color={"blue"}
                                        status={`${shipInfo.pendingAssignmentQty} pending production`}
                                    />
                                )} */}
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {shipInfo?.inputs?.map((input, ii) => (
                            <QtyInput
                                uid={item.itemControlUid}
                                input={input}
                                key={ii}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-2">
                    <Menu>
                        <Menu.Item
                            SubMenu={
                                <>
                                    <Menu.Item
                                        disabled={
                                            !shipInfo.pendingProductionQty
                                        }
                                    >
                                        Assigned Productions
                                    </Menu.Item>
                                    <Menu.Item
                                        disabled={
                                            !shipInfo.pendingProductionQty &&
                                            !shipInfo.pendingAssignmentQty
                                        }
                                    >
                                        All Pending Productions
                                    </Menu.Item>
                                </>
                            }
                        >
                            Submit
                        </Menu.Item>
                        <Menu.Item disabled>Mark All as Completed</Menu.Item>
                    </Menu>
                </div>
            </div>
        </div>
    );
}
function QtyInput({ uid, input }) {
    let available = input.available;
    // available = 100;
    if (!available) return null;
    // console.log(available);

    const form = useFormContext();

    const inputOptions = Array(available + 1)
        ?.fill(0)
        .map((a, i) => i?.toString());

    return (
        <div className="flex items-center gap-1">
            <span className="uppercase font-mono text-xs font-semibold">
                {input.label}:
            </span>
            {inputOptions.length > 15 ? (
                <FormInput
                    className="w-20"
                    type="number"
                    size="sm"
                    control={form.control}
                    name={`${uid}.${input.formKey}`}
                />
            ) : (
                <FormSelect
                    size="sm"
                    className="w-20"
                    control={form.control}
                    name={`${uid}.${input.formKey}`}
                    options={inputOptions}
                />
            )}
            <span className="text-xs font-mono font-bold">/{available}</span>
        </div>
    );
}
