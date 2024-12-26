import { prisma } from "@/db";
import { SalesFormFields } from "../../../types";
import { SaveQuery, SaveSalesClass } from "./save-sales-class";
import { SalesBookFormIncludes } from "../../utils/db-utils";
import { nextId } from "@/lib/nextId";
import { SaveSalesHelper } from "./helper-class";

export async function saveSalesFormDta(
    form: SalesFormFields,
    oldFormState?: SalesFormFields,
    query?: SaveQuery
) {
    const worker = new SaveSalesClass(form, oldFormState, query);
    await worker.execute();
    return worker.result();
}
export async function copySalesDta(orderId, as) {
    const copy = await prisma.salesOrders.findFirstOrThrow({
        where: {
            orderId,
        },
        include: SalesBookFormIncludes({}),
    });

    await prisma.$transaction((async (tx: typeof prisma) => {
        const nextIds = {
            item: null,
            order: null,
            salesDoor: null,
            formStep: null,
            hpt: null,
        };
        nextIds.item = await nextId(tx.salesOrderItems);
        nextIds.hpt = await nextId(tx.housePackageTools);
        nextIds.salesDoor = await nextId(tx.dykeSalesDoors);
        nextIds.formStep = await nextId(tx.dykeStepForm);
        nextIds.order = await nextId(tx.salesOrders);
        const {
            customerId,
            isDyke,
            goodUntil,
            billingAddressId,
            customerProfileId,
            grandTotal,
            status,
            deliveryOption,
            salesRepId,
            subTotal,
            summary,
            taxPercentage,
        } = copy;
        const newOrderId = await new SaveSalesHelper().generateOrderId(as);
        await tx.salesOrders.create({
            data: {
                orderId: newOrderId.orderId,
                id: newOrderId.id,
                createdAt: newOrderId.createdAt,
                slug: newOrderId.orderId,
                status,
                amountDue: copy.grandTotal,
                taxPercentage,
                summary,
                subTotal,
                salesRepId,
                deliveryOption,
                customerId,
                customerProfileId,
                goodUntil,
                grandTotal,
                billingAddressId,
                isDyke,
                items: {
                    createMany: {
                        data: copy.items.map(
                            ({
                                description,
                                discount,
                                discountPercentage,
                                meta,
                                qty,
                                rate,
                                swing,
                                tax,
                                total,
                                multiDyke,
                                multiDykeUid,
                                ...ri
                            }) => {
                                return {
                                    description,
                                    discount,
                                    discountPercentage,
                                    meta,
                                    qty,
                                    rate,
                                    swing,
                                    tax,
                                    total,
                                    multiDyke,
                                    multiDykeUid,
                                };
                            }
                        ),
                    },
                },
            },
        });
    }) as any);
}
