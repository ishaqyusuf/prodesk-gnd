import dayjs from "dayjs";
import {
    DykeSalesDoorMeta,
    SalesFormFields,
    SalesItemMeta,
    SalesMeta,
    SalesType,
} from "../../../types";
import { SaveSalesClass } from "./save-sales-class";
import { Prisma } from "@prisma/client";
import { formatMoney } from "@/lib/use-number";
import { isEqual, isNaN } from "lodash";
import { prisma } from "@/db";
import { isMonth } from "@/app/(clean-code)/_common/utils/db-utils";
import { AddressClass } from "./address-class";

export class SaveSalesHelper {
    constructor(public ctx?: SaveSalesClass) {}

    public paymentDueDate(md: SalesFormFields["metaData"]) {
        if (!md.paymentTerm || md.paymentTerm == "None") return null;
        const val = +md.paymentTerm?.toLowerCase()?.replace("net", null);
        return dayjs(md.createdAt).add(val, "days").toISOString();
    }
    public createRel(newId, oldId) {
        const resp: any = {};
        if (oldId) {
            if (oldId != newId && !newId) resp.disconnect = { id: oldId };
        }
        if (newId && newId != oldId) {
            resp.connect = { id: newId };
        }
        return resp;
    }
    public async composeSalesForm(form: SalesFormFields) {
        const md = form.metaData;
        const meta: Partial<SalesMeta> = {
            ccc: md.pricing.ccc,
            discount: md.pricing.discount,
            labor_cost: md.pricing.labour,
            po: md.po,
            qb: md.qb,
            payment_option: md.paymentMethod,
        };
        const sd = this.ctx.data;
        console.log(sd);

        const updateData = {
            subTotal: md.pricing.subTotal,
            grandTotal: md.pricing.grandTotal,
            paymentTerm: md.paymentTerm,
            deliveryOption: md.deliveryMode,
            meta: meta as any,
            amountDue: formatMoney(md.pricing.grandTotal - md.pricing.paid),
            paymentDueDate: null,
            goodUntil: this.convertDate(md.goodUntil),
            tax: md.pricing.taxValue,
            isDyke: true,
            type: md.type,
            salesProfile: md.salesProfileId
                ? {
                      connect: {
                          id: md.salesProfileId,
                      },
                  }
                : undefined,
            customer: this.createRel(sd.customerId, md.cad),
            billingAddress: this.createRel(sd.billingAddressId, md.bad),
            shippingAddress: this.createRel(sd.shippingAddressId, md.sad),

            // shippingAddress: {
            //     connect: sd.shippingAddressId
            //         ? { id: sd.shippingAddressId }
            //         : undefined,
            //     disconnect:
            //         md.sad != sd.shippingAddressId
            //             ? {
            //                   id: md.sad,
            //               }
            //             : undefined,
            // },
        } satisfies Prisma.SalesOrdersUpdateInput;

        if (md.type == "order") {
            updateData.paymentDueDate = this.paymentDueDate(md);
        }
        if (md.id) {
            return {
                data: updateData,
                id: md.id,
                updateId: md.id,
            };
        } else {
            const gord = await this.generateOrderId(md.type);
            const { orderId, createdAt, id } = gord;

            const { salesProfile, ...rest } = updateData;
            const createData = {
                ...rest,
                status: "",
                orderId,
                slug: orderId,
                id,
                createdAt,
                isDyke: true,
                // salesRepId: md.salesRepId,
                salesRep: {
                    connect: {
                        id: md.salesRepId,
                    },
                },

                salesProfile,
                // customerProfileId: md.salesProfileId,
            } satisfies Prisma.SalesOrdersCreateInput;
            return {
                id: createData.id,
                data: createData,
            };
        }
    }
    public composeTax() {
        const form = this.ctx.form;
        const updateTax = {
            tax: form.metaData.pricing.taxValue,
            taxxable: form.metaData.pricing.taxxable,
            taxConfig: {
                connect: {
                    taxCode: form.metaData.tax.taxCode,
                },
            },
        } satisfies Prisma.SalesTaxesUpdateInput;
        if (!form.metaData.tax.salesTaxId) {
            const createTax = {
                taxCode: form.metaData.tax.taxCode,
                salesId: this.ctx.salesId,
                taxxable: form.metaData.pricing.taxxable,
                tax: form.metaData.pricing.taxValue,
            } satisfies Prisma.SalesTaxesCreateManyInput;
            this.ctx.data.tax = {
                data: createTax,
            };
        } else {
            this.ctx.data.tax = {
                data: updateTax,
                updateId: form.metaData.tax.salesTaxId,
                id: form.metaData.tax.salesTaxId,
            };
        }
    }
    public compare(data1, data2) {
        const equals = isEqual(data1, data2);
        return equals;
        // return data1 == data2;
    }
    public async generateOrderId(type: SalesType) {
        const now = dayjs();
        const createdAt = now.toISOString();
        const prefix = type == "order" ? "ord" : "quo";

        const _createdAt = isMonth(now);

        const id =
            (await prisma.salesOrders.count({
                where: {
                    createdAt: _createdAt, //isDay(now),
                    orderId: {
                        startsWith: prefix,
                    },
                },
            })) + 1;
        // ORD-101124-01
        // ORD-111124-01
        // ORD-241111-01
        return {
            id: this.nextId("salesId"),
            prefix,
            createdAt,
            orderId: [
                prefix,
                // now.format('YY'),
                now.format("YYMMDD"),
                id?.toString()?.padStart(3, "0"),
            ].join("-"),
        };
    }
    public convertDate(date) {
        if (date instanceof Date) return date.toISOString();
        // if (!date || typeof date == "string")
        return date;
    }
    public getLineIndex(itemUid, data: SalesFormFields) {
        return data.sequence;
    }
    public nextId<K extends keyof (typeof this)["ctx"]["nextIds"]>(
        k: K
    ): number {
        let id = this.ctx.nextIds[k as any];
        this.ctx.nextIds[k as any] += 1;
        return id;
    }

    public safeInt(val, def = null) {
        const v = Number(val);
        if (isNaN(v)) return def;
        return v;
    }
    public getUnusedIds() {
        const oldData = this.ctx.oldFormState;

        const idStack = {
            itemIds: [],
            stepFormIds: [],
            hptIds: [],
            salesDoorIds: [],
        };
        Object.values(oldData.kvFormItem).map((data) => {
            // Object.entries(data.groupItem?.form || )
            idStack.hptIds.push(data.groupItem.hptId);
            Object.values(data?.groupItem?.form || {}).map((f) => {
                idStack.itemIds.push(f.meta.salesItemId);
                idStack.salesDoorIds.push(f.doorId);
            });
        });
        Object.values(oldData.kvStepForm)?.map((stepForm) => {
            idStack.stepFormIds.push(stepForm.stepFormId);
        });
        this.ctx.data.idStack = idStack;
        this.getDeleteIds(2, idStack.itemIds);
        this.getDeleteIds(3, idStack.stepFormIds);
        this.getDeleteIds(4, idStack.hptIds);
        this.getDeleteIds(5, idStack.salesDoorIds);
    }
    public getDeleteIds(priority, idStack) {
        const stacks = this.ctx.data.stacks;
        const stackIds = stacks
            .filter((s) => s.priority == priority)
            ?.map((s) => s.updateId)
            .filter(Boolean);
        const deleteIds = idStack
            ?.filter(Boolean)
            ?.filter((s) => !stackIds.includes(s));
        if (priority == 3) {
            console.log({
                stackIds,
                idStack,
                deleteIds,
            });
        }
        if (deleteIds?.length)
            this.ctx.data.deleteStacks.push({
                ids: deleteIds,
                priority,
            });
    }
}
type FormItem = SalesFormFields["kvFormItem"][""];
type GroupItemForm = FormItem["groupItem"]["form"][""];
