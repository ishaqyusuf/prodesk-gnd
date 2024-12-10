import { Prisma } from "@prisma/client";
import { SalesFormFields, SalesMeta } from "../../../types";
import { formatMoney } from "@/lib/use-number";
import { SaveSalesHelper } from "./helper-class";
import { nextId } from "@/lib/nextId";
import { prisma } from "@/db";
import { ItemHelperClass } from "./item-helper-class";

export interface SaverData {
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
        }[];
    }[];
}
export type HptData = SaverData["items"][number]["hpt"][number];

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
        return this.data;
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
            const doors = Object.entries(formItem.groupItem.form || {}).map(
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
