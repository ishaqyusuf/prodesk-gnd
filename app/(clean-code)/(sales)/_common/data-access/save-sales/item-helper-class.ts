import { Prisma } from "@prisma/client";
import {
    DykeSalesDoorMeta,
    HousePackageToolMeta,
    SalesFormFields,
    SalesItemMeta,
} from "../../../types";
import { HptData, SaverData, SaveSalesClass } from "./save-sales-class";

export class ItemHelperClass {
    constructor(public ctx: SaveSalesClass, public formItemId) {}
    public itemData: SaverData["items"][number];
    public formItem(old = false) {
        return old
            ? this.ctx.oldFormState?.kvFormItem[this.formItemId]
            : this.ctx.form?.kvFormItem?.[this.formItemId];
    }
    public workspace(old = false) {
        return old ? this.ctx.oldFormState : this.ctx.form;
    }
    public getLineIndex(old = false) {
        return (
            this.workspace(old).sequence?.formItem?.indexOf(this.formItemId) + 1
        );
    }
    public groupItemForm(old = false) {
        return this.formItem(old)?.groupItem?.form;
    }
    public generateDoorsItem() {
        const formItem = this.formItem();
        const lineIndex = this.getLineIndex();
        const form = this.groupItemForm();
        const formList = Object.values(form);
        const salesItemId = formList?.find((s) => s.meta?.salesItemId)?.meta
            ?.salesItemId;
        const meta = {
            doorType: formItem.groupItem.itemType,
            lineIndex,
        } satisfies SalesItemMeta;
        this.itemData = {
            id: salesItemId,
            formValues: [],
            hpt: [],
        };
        const updateData = {
            meta,
        } satisfies Prisma.SalesOrderItemsUpdateInput;
        if (!salesItemId) {
            const createData = {
                ...updateData,
                salesOrderId: this.ctx.data?.sales?.data?.id,
                id: this.ctx.nextId("itemId"),
            } satisfies Prisma.SalesOrderItemsCreateManyInput;
            this.itemData = {
                ...this.itemData,
                data: createData,
                id: createData.id,
            };
        } else {
            this.itemData = {
                id: salesItemId,
                formValues: [],
                hpt: [],
                data: {
                    ...updateData,
                },
            };
        }
        Array.from(new Set(Object.keys(form).map((k) => k.split("-")[0]))).map(
            (stepUid) => {
                const itemHtp: HptData = {
                    id: formItem.groupItem?.hptId,
                    doors: [],
                };
                const hptMeta = {} satisfies HousePackageToolMeta;
                const updateHpt = {
                    meta: hptMeta,
                } satisfies Prisma.HousePackageToolsUpdateInput;
                if (itemHtp.id) {
                } else {
                    const hpt = {
                        id: this.ctx.nextId("hpt"),
                        ...updateHpt,
                        orderItemId: this.itemData.id,
                        salesOrderId: this.ctx.data.sales.id,
                        doorType: formItem.groupItem.itemType,
                        stepProductId: formItem.groupItem.doorStepProductId,
                    } satisfies Prisma.HousePackageToolsCreateManyInput;
                    itemHtp.data = hpt;
                }
                Object.entries(form)
                    .filter(([uid]) => uid.startsWith(stepUid))
                    .map(([stepSizeUid, formData]) => {
                        const [_, ...dimensions] = stepSizeUid?.split("-");
                        const dimension = dimensions?.join("-");
                        console.log(dimension);

                        const doorData: HptData["doors"][number] = {
                            id: formData.doorId,
                        };
                        const updateDoor = {
                            dimension,
                            lhQty: this.ctx.safeInt(formData.qty.lh),
                            rhQty: this.ctx.safeInt(formData.qty.rh),
                            totalQty: this.ctx.safeInt(formData.qty.total),
                            jambSizePrice: this.ctx.safeInt(
                                formData.pricing.itemPrice.salesPrice
                            ),
                            doorPrice: this.ctx.safeInt(formData.pricing.addon),
                            meta: {
                                overridePrice: formData.pricing.customPrice,
                            } satisfies DykeSalesDoorMeta,
                            unitPrice: this.ctx.safeInt(
                                formData.pricing.unitPrice
                            ),
                            lineTotal: this.ctx.safeInt(
                                formData.pricing.totalPrice
                            ),
                            swing: formData.swing,
                        } satisfies Prisma.DykeSalesDoorsUpdateInput;
                        if (formData.doorId) {
                            doorData.data = updateDoor;
                        } else {
                            const createDoor = {
                                ...updateDoor,
                                id: this.ctx.nextId("salesDoor"),
                                housePackageToolId: itemHtp.id,
                                salesOrderId: this.ctx.data.sales.id,
                            } satisfies Prisma.DykeSalesDoorsCreateManyInput;
                            doorData.data = createDoor;
                        }
                        itemHtp.doors.push(doorData);
                    });
                this.itemData.hpt.push(itemHtp);
            }
        );
        this.ctx.data.items.push(this.itemData);
    }
    public generateNonDoorItem(
        gfId,
        gf: SalesFormFields["kvFormItem"][""]["groupItem"]["form"][""]
    ) {
        const lineIndex = this.getLineIndex();
        const formItem = this.formItem();
        const isMoulding = formItem?.groupItem?.type == "MOULDING";

        const meta = {
            doorType: formItem.groupItem.itemType,
            lineIndex,
        } satisfies SalesItemMeta;
        const updateData = {
            meta,
        } satisfies Prisma.SalesOrderItemsUpdateInput;
        if (!gf.meta.salesItemId) {
            const createData = {
                ...updateData,
                salesOrderId: this.ctx.data?.sales?.data?.id,
                id: this.ctx.nextId("itemId"),
            } satisfies Prisma.SalesOrderItemsCreateManyInput;
            this.itemData = {
                data: createData,
                id: createData.id,
                hpt: [],
            };
        } else {
            this.itemData = {
                data: updateData,
                id: gf.meta.salesItemId,
                hpt: [],
            };
        }
    }
}
