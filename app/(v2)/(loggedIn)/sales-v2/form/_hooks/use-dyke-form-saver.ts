import { useTransition } from "react";
import { DykeForm } from "../../type";
import { useRouter } from "next/navigation";
import { calculateSalesEstimate } from "../../_utils/calculate-sales-estimate";
import { saveDykeSales } from "../_action/save-dyke";
import { toast } from "sonner";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import { deepCopy } from "@/lib/deep-copy";

export default function useDykeFormSaver(form) {
    const [saving, startTransition] = useTransition();
    const router = useRouter();
    const [orderId, id, type] = form.getValues([
        "order.orderId",
        "order.id",
        "order.type",
    ]);
    function save(data: DykeForm) {
        startTransition(async () => {
            // console.log(data.itemArray[0]?.item);
            // return;
            const e = calculateSalesEstimate(initializeMultiComponents(data));
            console.log(e);
            console.log(e.itemArray.length);

            // return;
            const { order: resp, createHpts } = await saveDykeSales(e);
            console.log(createHpts);

            toast.success("Saved");
            if (!id) router.push(`/sales-v2/form/${resp.type}/${resp.slug}`);
            else await _revalidate("salesV2Form");
        });
    }
    function initializeMultiComponents(data: DykeForm) {
        let allItems: DykeForm["itemArray"] = [];
        let trash = {
            orderItems: [] as any,
            housePackageTools: [] as any,
            doorForms: [] as any,
        };
        data.itemArray.map((item) => {
            let items: DykeForm["itemArray"] = [];
            // if (!item?.multiComponent?.components) {
            if (item.item.shelfItemArray.length) {
                allItems.push(item);
                return;
            }
            // }
            const components = Object.values(item.multiComponent.components);
            let parented =
                components.find(
                    (c) => c.checked && c.itemId && c.itemId == item.item.id
                ) != null;
            components.map((c) => {
                if (!c.checked) {
                    trash.orderItems.push(c.itemId);
                    trash.housePackageTools.push(c.hptId);
                    return;
                }
                const isMoulding = Object.values(c.heights || {}).every(
                    (h) => !h.checked
                );
                let clone: DykeForm["itemArray"][0] = deepCopy(item);
                clone.item.multiDyke = false;
                if ((c.itemId && c.itemId == item.item.id) || !parented) {
                    clone.item.multiDyke = true;
                    console.log("parented");
                    parented = true;
                }
                clone.item.multiDykeUid = item.multiComponent.uid as any;
                clone.item.housePackageTool.id = c.hptId as any;
                if (!isMoulding) {
                    if (!clone.item.multiDyke) {
                        clone.item.formStepArray = [];
                    }
                    clone.item.id = c.itemId as any;
                    Object.keys(c._doorForm || {}).map((k) => {
                        const df = c._doorForm?.[k];
                        if (!c.heights?.[k]?.checked && df) {
                            trash.doorForms.push(df.id);
                            delete c._doorForm?.[k];
                        }
                    });
                    clone.item.housePackageTool._doorForm = c._doorForm;
                    clone.item.housePackageTool.totalDoors = c.doorQty;
                    let {
                        createdAt,
                        deletedAt,
                        orderItemId,
                        updatedAt,
                        totalDoors,
                        dykeDoorId,
                        moldingId,
                        ...rest
                    } = clone.item.housePackageTool;
                    dykeDoorId = c.toolId;
                    console.log(dykeDoorId);

                    clone.item.housePackageTool = {
                        ...rest,
                        dykeDoorId,
                    };
                    const filterItems = () => {
                        const {
                            createdAt,
                            deletedAt,
                            updatedAt,
                            meta,
                            ...rest
                        } = clone.item;
                        return {
                            ...(rest as any),
                        };
                    };
                    clone.item = filterItems();
                    clone.item.qty = 1;
                    clone.item.rate =
                        clone.item.price =
                        clone.item.total =
                            c.doorTotalPrice;
                } else {
                    clone.item.price = clone.item.rate = c.unitPrice;
                    clone.item.total = c.totalPrice;
                    clone.item.qty = c.qty;
                    clone.item.housePackageTool.dykeDoorId = null;
                    clone.item.housePackageTool.moldingId = c.toolId;
                }
                items.push(clone);
            });
            if (items.length == 1 && items?.[0]?.item) {
                items[0].item.multiDyke = false;
                items[0].item.multiDykeUid = null;
            }
            allItems.push(...items);
        });
        data.itemArray = allItems;
        return data;
    }
    return {
        saving,
        save,
    };
}
