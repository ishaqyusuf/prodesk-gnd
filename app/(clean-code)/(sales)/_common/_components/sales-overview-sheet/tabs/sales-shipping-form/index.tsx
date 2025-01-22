import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import FormSelect from "@/components/common/controls/form-select";
import { dispatchModes } from "../../../../utils/contants";
import Button from "@/components/common/button";
import Portal from "@/components/_v1/portal";
import { Menu } from "@/components/(clean-code)/menu";
import { cn, sum } from "@/lib/utils";
import FormInput from "@/components/common/controls/form-input";
import { CheckCircle } from "lucide-react";
import ProgressStatus from "@/components/_v1/progress-status";
import { ItemShippable, Shippable, useSalesShipmentForm } from "./ctx";
import { createSalesShipment } from "./create-shipment";

export function SalesShippingForm({}) {
    const ctx = useSalesShipmentForm();
    const { form, itemView, store, totalSelected, selectionError } = ctx;
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
                        <Button
                            onClick={async () => {
                                await createSalesShipment(ctx);
                            }}
                            className=""
                        >
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
    const [lh, rh, qty, total, shipInfo] = form.watch([
        `${uid}.lh`,
        `${uid}.rh`,
        `${uid}.qty`,
        `${uid}.total`,
        `${uid}.shipInfo`,
    ]);
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
            shipping.pendingAssignmentQty += status?.prodAssigned?.autoComplete
                ? 0
                : sum([totalQty, -1 * assignProdQty]);
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
        form.setValue(`${uid}.shipInfo`, shipping);
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
                        <div className="uppercase font-mono text-muted-foreground text-sm font-semibold">
                            <span>{item.inlineSubtitle}</span>
                        </div>
                        {/* <div className="uppercase text-muted-foreground text-sm font-normal space-x-2">
                            <span>{item.sectionTitle}</span>
                            <span>{item.subtitle}</span>
                            <span>{item.swing}</span>
                        </div> */}
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
