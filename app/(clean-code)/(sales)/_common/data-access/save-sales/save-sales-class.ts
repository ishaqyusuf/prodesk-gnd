import { Prisma, SalesOrders } from "@prisma/client";
import { SalesFormFields, SalesMeta } from "../../../types";
import { formatMoney } from "@/lib/use-number";
import { SaveSalesHelper } from "./helper-class";
import { nextId } from "@/lib/nextId";
import { prisma } from "@/db";
import { ItemHelperClass } from "./item-helper-class";
import { generateRandomString } from "@/lib/utils";
import { redirect } from "next/navigation";
import { timeout } from "@/lib/timeout";
import { AddressClass } from "./address-class";

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
}

export type HptData = SaverData["items"][number]["hpt"];

export class SaveSalesClass extends SaveSalesHelper {
    public result() {
        const data = this.data;
        if (data.error) {
            return { data };
        }
        const salesResp = data.result?.[data.orderTxIndex] as SalesOrders;
        const isUpdate = data.sales.data?.id == null;
        const redirectTo = !isUpdate
            ? `/sales-book/edit-${this.form.metaData.type}/${salesResp.slug}`
            : null;
        if (redirectTo) redirect(redirectTo);
        return {
            slug: salesResp.slug,
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
        public oldFormState?: SalesFormFields
    ) {
        super();
        this.ctx = this;
        this.data = {
            items: [],
            orderTxIndex: -1,
            deleteStacks: [],
            stacks: [],
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
        // await this.saveData2();
    }
    public async saveData() {
        this.composeSaveStacks();
        this.getUnusedIds();
        const data = Object.values(this.groupByPriorityAndId());
        this.data.tx = data;
        // this.data.error = "BREAK";
        // return;
        // return data;
        const txs = [];
        this.data.deleteStacks
            ?.filter((s) => s?.ids?.length)
            .map((s) => {
                const table = this.getTable(s.priority);
                // prisma.dykeStepForm.updateMany({
                //     where: {
                //         id: {in: []}
                //     },
                //     data: {
                //         deletedAt: new Date()
                //     }
                // })
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
                                data: u.data,
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
            const transactions = await prisma.$transaction(txs);
            this.data.result = transactions;
        } catch (error) {
            if (error instanceof Error) this.data.error = error.message;
            else this.data.error = "ERROR";
        }
    }
    public async saveData2() {
        this.composeSaveStacks();
        this.getUnusedIds();
        const data = Object.values(this.groupByPriorityAndId());
        this.data.tx = data;
        // this.data.error = "BREAK";
        // return;
        // return data;
        try {
            await prisma.$transaction((async (tx) => {
                const txs = [];
                function createTx(fn, data) {
                    txs.push({
                        tx: fn(data),
                        data,
                    });
                }
                this.data.deleteStacks
                    ?.filter((s) => s?.ids?.length)
                    .map((s) => {
                        const table = this.getTable(s.priority, tx);
                        createTx(table.updateMany, {
                            where: {
                                id: { in: s.ids },
                            },
                            data: {
                                deletedAt: new Date(),
                            },
                        });
                        this.data.orderTxIndex++;
                    });
                data.map((dt) => {
                    const orderTx = dt.priority == 1;

                    if (dt.update.length) {
                        dt.update
                            .filter((u) => u.data)
                            .map((u) => {
                                const table = this.getTable(dt.priority, tx);
                                if (!this.data.orderTxIndexFound) {
                                    this.data.orderTxIndex++;
                                    this.data.orderTxIndexFound = orderTx;
                                }
                                createTx(table.update, {
                                    where: {
                                        id: u.id,
                                    },
                                    data: u.data,
                                });
                            });
                    }
                    const createManyData = dt.create
                        .map((d) => d.data)
                        .filter(Boolean);
                    if (createManyData.length) {
                        const table = this.getTable(dt.priority, tx);
                        if (!this.data.orderTxIndexFound) {
                            this.data.orderTxIndex++;
                            this.data.orderTxIndexFound = orderTx;
                        }
                        // prisma.salesOrders
                        if (orderTx)
                            createTx(table.create, {
                                data: createManyData[0],
                            });
                        else
                            createTx(table.createMany, {
                                data: createManyData,
                            });
                    }
                });
                try {
                    const results = await Promise.all(
                        txs.map(async (ts, index) => {
                            await timeout(index * 20);
                            const resp = await ts.tx;
                            return resp;
                        })
                    );
                    this.data.result = results;
                } catch (error) {
                    // console.log(index, ts.data);
                    throw error;
                }
            }) as any);
            // const transactions = await prisma.$transaction(
            //     txs,
            //     // Prisma.TransactionIsolationLevel.Serializable
            // );
        } catch (error) {
            if (error instanceof Error) this.data.error = error.message;
            else this.data.error = "ERROR";
        }
    }
    public groupByPriorityAndId() {
        return this.data.stacks.reduce<
            Record<
                number,
                {
                    priority: any;
                    update: { id?; data? }[];
                    create: { id?; data? }[];
                }
            >
        >((acc, stack) => {
            if (!stack.priority) return acc; // Skip items without a priority
            if (!acc[stack.priority])
                acc[stack.priority] = {
                    update: [],
                    create: [],
                    priority: stack.priority,
                };
            // stack.table[stack.pr]
            if (stack.priority == 1) console.log(stack);

            const sd = { id: stack.updateId, data: stack.data };
            if (sd.id) {
                acc[stack.priority].update.push(sd); // Group under 'update' if id exists
            } else {
                acc[stack.priority].create.push(sd); // Group under 'create' if id is undefined
            }
            return acc;
        }, {});
    }

    public createStack(formData, priority) {
        const id = formData.id;
        const isUpdate = !formData.data?.id;
        this.data.stacks.push({
            priority,
            id,
            updateId: isUpdate ? id : null,
            data: formData.data,
        });
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
        console.log(this.ctx.data.customerId);

        const saveData = await this.composeSalesForm(this.form);
        // if (saveData.id) {
        //     // if (
        //     //     this.compare(
        //     //         saveData,
        //     //         await this.composeSalesForm(this.oldFormState)
        //     //     )
        //     // ) {
        //         // this.data.sales = {
        //         //     id: saveData.id,
        //         // };
        //     } else {
        //         this.data.sales = {
        //             ...saveData,
        //             updateId: saveData.id,
        //         };
        //     // }
        // } else {
        // if(saveData.id)
        console.log(saveData);

        this.data.sales = saveData;
        // }
    }
    public nextIds = {
        itemId: null,
        hpt: null,
        salesDoor: null,
        formStep: null,
        salesId: null,
    };
    public async generateItemsForm() {
        Object.entries(this.form.kvFormItem).map(([itemId, formItem]) => {
            if (!formItem?.groupItem?.groupUid)
                formItem.groupItem.groupUid = generateRandomString(4);
            const formEntries = Object.entries(
                formItem.groupItem.form || {}
            ).filter(([k, v]) => v.selected);
            const primaryForm = formEntries.find(
                ([k, v], i) => v.primaryGroupItem
            );
            if (!primaryForm && formEntries.length) {
                formEntries[0][1].primaryGroupItem = true;
            }
            formEntries.map(([groupItemFormId, groupItemForm], index) => {
                const itemCtx = new ItemHelperClass(this, itemId);
                if (index == 0 && groupItemFormId?.split("-")?.length > 2) {
                    itemCtx.generateDoorsItem();
                } else {
                    itemCtx.generateNonDoorItem(groupItemFormId, groupItemForm);
                }
            });
        });
    }
}
