import { Prisma } from "@prisma/client";
import { SalesFormFields, SalesMeta } from "../../../types";
import { formatMoney } from "@/lib/use-number";
import { SaveSalesHelper } from "./helper-class";
import { nextId } from "@/lib/nextId";
import { prisma } from "@/db";
import { ItemHelperClass } from "./item-helper-class";
import { generateRandomString } from "@/lib/utils";

export interface SaverData {
    tx?;
    sales?: { id?; data? };
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
}
export type HptData = SaverData["items"][number]["hpt"];

export class SaveSalesClass extends SaveSalesHelper {
    public data: SaverData = {};
    constructor(
        public form: SalesFormFields,
        public oldFormState?: SalesFormFields
    ) {
        super();
        this.ctx = this;
        this.data = {
            items: [],
        };
    }
    public async execute() {
        await this.generateSalesForm();
        await this.generateItemsForm();
        await this.saveData();
    }
    public async saveData() {
        this.composeSaveStacks();
        const data = Object.values(this.groupByPriorityAndId());
        this.data.tx = data.map(({ create, update }) => ({ create, update }));
        // return data;
        const txs = [];
        data.map((dt) => {
            if (dt.update.length) {
                dt.update
                    .filter((u) => u.data)
                    .map((u) => {
                        if (u.data) {
                            txs.push(
                                dt.table?.update({
                                    where: {
                                        id: u.id,
                                    },
                                    data: u.data,
                                })
                            );
                        }
                    });
            }
            if (dt.create.length) {
                const createManyData = dt.create
                    .map((d) => d.data)
                    .filter(Boolean);
                if (createManyData.length)
                    txs.push(
                        dt.table.createMany({
                            data: createManyData,
                        })
                    );
            }
        });
        await prisma.$transaction(txs);
    }
    public stacks: {
        id?;
        data?;
        table?;
        priority;
    }[] = [];
    public groupByPriorityAndId() {
        return this.stacks.reduce<
            Record<
                number,
                {
                    table: any;
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
                    table: stack.table,
                };
            // stack.table[stack.pr]
            const sd = { id: stack.id, data: stack.data };
            if (stack.id) {
                acc[stack.priority].update.push(sd); // Group under 'update' if id exists
            } else {
                acc[stack.priority].create.push(sd); // Group under 'create' if id is undefined
            }
            return acc;
        }, {});
    }

    public createStack(formData, table, priority) {
        const id = formData.id;
        const isUpdate = !formData.data?.id;
        this.stacks.push({
            table,
            id: isUpdate ? id : null,
            data: formData.data,
            priority,
        });
    }
    public composeSaveStacks() {
        this.stacks = [];
        const data = this.data;
        this.createStack(data.sales, prisma.salesOrders, 1);
        data.items.map((item) => {
            this.createStack(item, prisma.salesOrderItems, 2);
            item.formValues?.map((fv) => {
                this.createStack(item, prisma.dykeStepForm, 3);
            });
            if (item.hpt) {
                this.createStack(item.hpt, prisma.housePackageTools, 4);
                item.hpt.doors?.map((door) => {
                    this.createStack(door, prisma.dykeSalesDoors, 5);
                });
            }
        });
    }
    public async generateSalesForm() {
        const saveData = await this.composeSalesForm(this.form);
        if (saveData.id) {
            if (
                this.compare(
                    saveData,
                    await this.composeSalesForm(this.oldFormState)
                )
            ) {
                this.data.sales = {
                    id: saveData.id,
                };
            } else {
                this.data.sales = saveData;
            }
        } else {
            this.data.sales = saveData;
        }
    }
    public nextIds = {
        itemId: null,
        hpt: null,
        salesDoor: null,
    };
    public async generateItemsForm() {
        this.nextIds.itemId = await nextId(prisma.salesOrderItems);
        this.nextIds.hpt = await nextId(prisma.housePackageTools);
        this.nextIds.salesDoor = await nextId(prisma.dykeSalesDoors);
        Object.entries(this.form.kvFormItem).map(([itemId, formItem]) => {
            if (!formItem?.groupItem?.groupUid)
                formItem.groupItem.groupUid = generateRandomString(4);
            const formEntries = Object.entries(formItem.groupItem.form || {});
            const primaryForm = formEntries.find(
                ([k, v], i) => v.primaryGroupItem
            );
            if (!primaryForm && formEntries.length) {
                formEntries[0][1].primaryGroupItem = true;
                console.log("PRIMARY");
            }
            const doors = formEntries.map(
                ([groupItemFormId, groupItemForm], index) => {
                    console.log(groupItemFormId);

                    if (index == 0 && groupItemFormId?.split("-")?.length > 2) {
                        const itemCtx = new ItemHelperClass(this, itemId);
                        itemCtx.generateDoorsItem();
                    } else {
                        const itemCtx = new ItemHelperClass(this, itemId);
                        itemCtx.generateNonDoorItem(
                            groupItemFormId,
                            groupItemForm
                        );
                    }
                }
            );
        });
    }
}
