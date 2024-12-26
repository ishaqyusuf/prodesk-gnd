import { Prisma } from "@prisma/client";
import {
    DykeFormStepMeta,
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
        return this.workspace(old)?.kvFormItem[this.formItemId];
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
    public formSteps(old = false) {
        const ws = this.workspace(old);
        const stepSequence = ws.sequence?.stepComponent?.[this.formItemId];

        return stepSequence?.map((s) => ws.kvStepForm[s]);
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

        const updateData = {
            meta,
        } satisfies Prisma.SalesOrderItemsUpdateInput;
        if (!salesItemId) {
            const { ...rest } = updateData;
            const createData = {
                ...rest,
                salesOrderId: this.ctx.salesId,
                id: this.ctx.nextId("itemId"),
            } satisfies Prisma.SalesOrderItemsCreateManyInput;
            this.itemData = {
                data: createData,
                id: createData.id,
                formValues: [],
            };
        } else {
            this.itemData = {
                id: salesItemId,
                formValues: [],
                data: {
                    ...updateData,
                },
            };
        }
        this.generateItemFormSteps();
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
                salesOrderId: this.ctx.salesId,
                doorType: formItem.groupItem.itemType,
                stepProductId: formItem.groupItem.doorStepProductId,
            } satisfies Prisma.HousePackageToolsCreateManyInput;
            itemHtp.data = hpt;
            itemHtp.id = hpt.id;
        }
        Array.from(new Set(Object.keys(form).map((k) => k.split("-")[0]))).map(
            (stepUid) => {
                Object.entries(form)
                    .filter(
                        ([uid, formData]) =>
                            uid.startsWith(stepUid) && formData.selected
                    )
                    .map(([stepSizeUid, formData]) => {
                        const [_, ...dimensions] = stepSizeUid?.split("-");
                        const dimension = dimensions?.join("-");

                        const doorData: HptData["doors"][number] = {
                            id: formData.doorId,
                        };
                        const updateDoor = this.composeSalesDoorUpdateData(
                            formData,
                            dimension
                        );

                        if (formData.doorId) {
                            if (
                                this.validateSalesDoorUpdate(
                                    formData.doorId,
                                    updateDoor,
                                    stepSizeUid,
                                    dimension
                                )
                            )
                                doorData.data = updateDoor;
                        } else {
                            const { ...rest } = updateDoor;
                            const createDoor = {
                                ...rest,
                                id: this.ctx.nextId("salesDoor"),
                                housePackageToolId: itemHtp.id,
                                salesOrderId: this.ctx.salesId,
                                salesOrderItemId: this.itemData.id,
                            } satisfies Prisma.DykeSalesDoorsCreateManyInput;
                            doorData.data = createDoor;
                            doorData.id = createDoor.id;
                        }
                        itemHtp.doors.push(doorData);
                    });
                this.itemData.hpt = itemHtp;
            }
        );
        if (this.itemData.hpt?.doors?.length)
            this.ctx.data.items.push(this.itemData);
    }

    public generateItemFormSteps() {
        const steps = this.formSteps();
        steps.map((step) => {
            const updateData = this.composeStepUpdateData(step);
            if (!step.stepFormId) {
                const { ...rest } = updateData;
                const createData = {
                    ...rest,
                    id: this.ctx.nextId("formStep"),
                    stepId: step.stepId,
                    salesId: this.ctx.salesId,
                    salesItemId: this.itemData.id,
                } satisfies Prisma.DykeStepFormCreateManyInput;
                this.itemData.formValues.push({
                    data: createData,
                    id: createData.id,
                });
            } else {
                this.itemData.formValues.push(
                    this.validateFormValueUpdate(step.stepFormId, updateData)
                );
            }
        });
    }
    public composeStepUpdateData(step) {
        const meta = {} satisfies DykeFormStepMeta;
        return {
            basePrice: this.ctx.safeInt(step.basePrice),
            price: this.ctx.safeInt(step.salesPrice),
            prodUid: step.componentUid,
            qty: 1,
            meta,
            value: step.value,
            // salesOrderItem: {
            //     connect: {
            //         id: this.itemData.id,
            //     },
            // },
        } satisfies Prisma.DykeStepFormUpdateInput;
    }
    public composeSalesDoorUpdateData(formData, dimension) {
        return {
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
            unitPrice: this.ctx.safeInt(formData.pricing.unitPrice),
            lineTotal: this.ctx.safeInt(formData.pricing.totalPrice),
            swing: formData.swing,
        } satisfies Prisma.DykeSalesDoorsUpdateInput;
    }
    public validateSalesDoorUpdate(
        id,
        data: Prisma.DykeSalesDoorsUpdateInput,
        formUid,
        dimension
    ) {
        const group = this.groupItemForm(true);
        const formData = group?.[formUid];
        if (formData) {
            const updateDoor = this.composeSalesDoorUpdateData(
                formData,
                dimension
            );
            return this.ctx.compare(data, updateDoor) ? false : true;
        }

        return true;
    }

    public validateFormValueUpdate(id, data: Prisma.DykeStepFormUpdateInput) {
        const _: any = { id };
        const fss = this.formSteps(true);
        const formStep = fss?.find((s) => s.stepFormId == id);

        if (formStep) {
            const updateData = this.composeStepUpdateData(formStep);
            if (this.ctx.compare(data, updateData)) {
                return _;
            }
        }
        _.data = data;
        return _;
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
            ...(isMoulding
                ? {}
                : {
                      tax: gf?.meta?.taxxable,
                  }),
        } satisfies SalesItemMeta;

        const updateData = {
            meta,
            ...(isMoulding
                ? {}
                : {
                      dykeProduction: gf.meta?.produceable || false,
                  }),
            rate: this.ctx.safeInt(gf?.pricing?.unitPrice),
            total: this.ctx.safeInt(gf?.pricing?.totalPrice),
            description: gf.meta.description,
            qty: this.ctx.safeInt(gf.qty.total),
            multiDykeUid: formItem.groupItem.groupUid,
            multiDyke: gf.primaryGroupItem,

            // salesOrder
        } satisfies Prisma.SalesOrderItemsUpdateInput;
        const { multiDykeUid, multiDyke, ...rest } = updateData;
        if (!gf.meta.salesItemId) {
            const createData = {
                ...updateData,
                salesOrderId: this.ctx.salesId,
                id: this.ctx.nextId("itemId"),
            } satisfies Prisma.SalesOrderItemsCreateManyInput;
            this.itemData = {
                data: createData,
                id: createData.id,
                formValues: [],
            };
        } else {
            this.itemData = {
                data: updateData,
                id: gf.meta.salesItemId,
                formValues: [],
            };
        }
        if (gf.primaryGroupItem) this.generateItemFormSteps();
        if (isMoulding) {
            const itemHtp: HptData = {
                id: gf.hptId,
            };

            const hptMeta = {
                priceTags: {
                    moulding: {
                        addon: this.ctx.safeInt(gf.pricing?.addon),
                        overridePrice: this.ctx.safeInt(
                            gf.pricing?.customPrice
                        ),
                        salesPrice: this.ctx.safeInt(
                            gf?.pricing?.itemPrice?.salesPrice
                        ),
                        basePrice: this.ctx.safeInt(
                            gf?.pricing?.itemPrice?.basePrice
                        ),
                        price: this.ctx.safeInt(gf?.pricing?.unitPrice),
                    },
                },
            } satisfies HousePackageToolMeta;
            const updateHpt = {
                meta: hptMeta,
            } satisfies Prisma.HousePackageToolsUpdateInput;
            if (itemHtp.id) {
                itemHtp.data = updateHpt;
            } else {
                const hpt = {
                    id: this.ctx.nextId("hpt"),
                    ...updateHpt,
                    orderItemId: this.itemData.id,
                    salesOrderId: this.ctx.salesId,
                    doorType: formItem.groupItem.itemType,
                    stepProductId: gf.stepProductId,
                    moldingId: gf.mouldingProductId,
                } satisfies Prisma.HousePackageToolsCreateManyInput;
                itemHtp.data = hpt;
                itemHtp.id = hpt.id;
                console.log("CREATE");
            }
            this.itemData.hpt = itemHtp;
        }
        //  if (this.itemData.hpt?.doors)
        this.ctx.data.items.push(this.itemData);
    }
}
