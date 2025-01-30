import { SalesOrders } from "@prisma/client";
import { SalesFormFields } from "../../../types";
import { SaveSalesHelper } from "./helper-class";
import { nextId } from "@/lib/nextId";
import { prisma } from "@/db";
import { ItemHelperClass } from "./item-helper-class";
import { generateRandomString } from "@/lib/utils";
import { redirect } from "next/navigation";
import { AddressClass } from "./address-class";
import { composeSalesUrl } from "../../utils/sales-utils";

export interface SaverData {
    tx?;
    error?;
    idStack?: {
        itemIds: number[];
        stepFormIds: number[];
        hptIds: number[];
        salesDoorIds: number[];
    };
    sales?: { id?; data?; updateId? };
    customerId?;
    billingAddressId?;
    shippingAddressId?;
    deleteStacks?: { ids; priority }[];
    orderTxIndex: number;
    orderTxIndexFound?: boolean;
    tax?: {
        id?;
        data?;
        updateId?;
    };
    result?;
    items?: {
        id?;
        data?;
        formValues?: {
            id?;
            data?;
        }[];
        hpt?: {
            id?;
            data?;
            doors?: {
                id?;
                data?;
            }[];
        };
    }[];
    stacks?: {
        id;
        updateId?;
        data?;
        priority;
    }[];

    reqData?;
}

export type HptData = SaverData["items"][number]["hpt"];
export type SaveQuery = {
    restoreMode: boolean;
    allowRedirect: boolean;
    copy?: boolean;
};
export class SaveSalesClass extends SaveSalesHelper {
    public result() {
        let __redirect = this.query?.allowRedirect;
        const data = this.data;
        if (data.error) {
            return { data };
        }
        const salesResp = data.result?.[data.orderTxIndex] as SalesOrders;

        const isUpdate = data.sales.data?.id == null;
        const type = this.form.metaData.type;
        const redirectTo =
            (!isUpdate || this.query?.restoreMode) && salesResp
                ? composeSalesUrl({
                      slug: salesResp.slug,
                      type,
                      isDyke: true,
                  })
                : null;
        console.log(this.form?.saveAction, redirectTo);

        switch (this.form?.saveAction) {
            case "close":
                redirect(`/sales-book/${type}s`);
            case "default":
                if (redirectTo && (__redirect || this.query?.restoreMode))
                    redirect(redirectTo);
            case "new":
                redirect(`/sales-book/create-${type}`);
        }

        return {
            slug: salesResp?.slug,
            redirectTo,
            data,
        };
    }
    public getTable(priority, tx = prisma) {
        if (!priority) priority = 0;
        return [
            tx.salesOrders as any,
            tx.salesOrderItems as any,
            tx.dykeStepForm as any,
            tx.housePackageTools as any,
            tx.dykeSalesDoors as any,
            tx.salesTaxes as any,
        ][priority - 1];
    }
    public data: SaverData = {
        orderTxIndex: -1,
    };
    constructor(
        public form: SalesFormFields,
        public oldFormState?: SalesFormFields,
        public query?: SaveQuery
    ) {
        super();
        this.ctx = this;
        this.data = {
            items: [],
            orderTxIndex: -1,
            deleteStacks: [],
            stacks: [],
            reqData: { form, oldFormState },
        };
    }
    public async execute() {
        this.nextIds.itemId = await nextId(prisma.salesOrderItems);
        this.nextIds.hpt = await nextId(prisma.housePackageTools);
        this.nextIds.salesDoor = await nextId(prisma.dykeSalesDoors);
        this.nextIds.formStep = await nextId(prisma.dykeStepForm);
        this.nextIds.salesId = await nextId(prisma.salesOrders);
        await this.generateSalesForm();
        await this.generateItemsForm();
        this.composeTax();
        await this.saveData();
    }
    public get isRestoreMode() {
        return this.query?.restoreMode;
    }
    public async saveData() {
        this.composeSaveStacks();
        this.getUnusedIds();
        const data = Object.values(this.groupByPriorityAndId());
        this.data.tx = data;

        const txs = [];
        this.data.deleteStacks
            ?.filter((s) => s?.ids?.length)
            .map((s) => {
                const table = this.getTable(s.priority);

                txs.push(
                    table.updateMany({
                        where: {
                            id: { in: s.ids },
                        },
                        data: {
                            deletedAt: new Date(),
                        },
                    })
                );
                this.data.orderTxIndex++;
            });
        data.map((dt) => {
            const orderTx = dt.priority == 1;

            if (dt.update.length) {
                dt.update
                    .filter((u) => u.data)
                    .map((u) => {
                        const table = this.getTable(dt.priority);
                        if (!this.data.orderTxIndexFound) {
                            this.data.orderTxIndex++;
                            this.data.orderTxIndexFound = orderTx;
                        }

                        txs.push(
                            table?.update({
                                where: {
                                    id: u.id,
                                },
                                data: {
                                    ...u.data,
                                    deletedAt: null,
                                },
                            })
                        );
                    });
            }
            const createManyData = dt.create.map((d) => d.data).filter(Boolean);
            if (createManyData.length) {
                const table = this.getTable(dt.priority);
                if (!this.data.orderTxIndexFound) {
                    this.data.orderTxIndex++;
                    this.data.orderTxIndexFound = orderTx;
                }
                // prisma.salesOrders
                txs.push(
                    orderTx
                        ? table.create({
                              data: createManyData[0],
                          })
                        : table.createMany({
                              data: createManyData,
                          })
                );
            }
        });

        try {
            // TODO: REMOVE
            // if (data.filter((d) => d.priority == 2).length > 1) return;
            if (this.form.metaData.debugMode) return;
            const transactions = await prisma.$transaction(txs);
            this.data.result = transactions;
        } catch (error) {
            if (error instanceof Error) this.data.error = error.message;
            else this.data.error = "ERROR";
        }
    }

    public composeSaveStacks() {
        this.data.stacks = [];
        const data = this.data;
        this.createStack(data.sales, 1);
        data.items.map((item) => {
            this.createStack(item, 2);
            item.formValues?.map((fv) => {
                this.createStack(fv, 3);
            });
            if (item.hpt) {
                this.createStack(item.hpt, 4);
                item.hpt.doors?.map((door) => {
                    this.createStack(door, 5);
                });
            }
        });
        this.createStack(data.tax, 6);
    }
    public get salesId() {
        return this.data.sales?.id || this.data.sales?.updateId;
    }
    public async generateSalesForm() {
        const addrs = new AddressClass(this.ctx);
        await addrs.saveAddress();

        const saveData = await this.composeSalesForm(this.form);

        this.data.sales = saveData;
    }
    public nextIds = {
        itemId: null,
        hpt: null,
        salesDoor: null,
        formStep: null,
        salesId: null,
    };
    public async generateItemsForm() {
        this.form.sequence.formItem.map((itemId) => {
            const formItem = this.form.kvFormItem[itemId];
            // formItem.uid
            if (!formItem?.groupItem?.groupUid)
                formItem.groupItem.groupUid = generateRandomString(4);
            const formEntries = Object.entries(
                formItem.groupItem.form || {}
            ).filter(([k, v]) => v.selected);
            // console.log(formEntries);
            const primaryForm = formEntries.find(
                ([k, v], i) => v.primaryGroupItem
            );
            if (!primaryForm && formEntries.length) {
                formEntries[0][1].primaryGroupItem = true;
            }
            formEntries.map(([groupItemFormId, groupItemForm], index) => {
                const itemCtx = new ItemHelperClass(this, itemId);

                console.log({ groupItemForm, groupItemFormId });
                if (groupItemFormId?.split("-")?.length > 2) {
                    if (index == 0) {
                        console.log(itemId);
                        itemCtx.generateDoorsItem();
                    }
                } else {
                    console.log(groupItemForm);

                    itemCtx.generateNonDoorItem(
                        groupItemFormId,
                        groupItemForm,
                        groupItemForm.primaryGroupItem
                    );
                }
            });
        });
    }
}
