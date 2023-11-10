"use server";

import { prisma } from "@/db";
import { deleteOrderAction } from "../sales/sales";

// return;
export async function _restoreSalesOrder() {
    return;
    // console.log(
    //     await prisma.salesOrders.count({
    //         where: {
    //             id: 605
    //         }
    //     })
    // );
    // return;
    // await deleteOrderAction(605);
    const { items, payments, productions, ...sales } = saleObj;
    await prisma.salesOrders.create({
        data: {
            ...sales,
            items: {
                createMany: {
                    data: [...items],
                    skipDuplicates: true
                }
            },
            payments: {
                createMany: {
                    data: [...payments]
                }
            },
            productions: {
                createMany: {
                    data: [...productions]
                }
            }
        }
    });
    // const sales = await prisma.salesOrders.findFirst({
    //     where: {
    //         orderId: "23-1023-605"
    //     },
    //     include: {
    //         items: true,
    //         productions: true,
    //         payments: true
    //     }
    // });
    // console.log(sales?.payments);
}
const saleObj = {
    id: 605,
    title: null,
    customerId: 169,
    billingAddressId: 332,
    shippingAddressId: 332,
    salesRepId: 1,
    pickupId: null,
    prodId: 44,
    summary: null,
    instruction: null,
    meta: { ccc: 0, rep: "Pablo Cruz", ccc_percentage: "3" },
    status: "Active",
    inventoryStatus: null,
    deletedAt: null,
    createdAt: new Date("2023-10-23T23:46:47.000Z"),
    updatedAt: new Date("2023-11-06T21:23:23.000Z"),
    orderId: "23-1023-605",
    slug: "23-1023-605",
    type: "order",
    goodUntil: null,
    paymentTerm: null,
    prodQty: 11,
    builtQty: 10,
    subTotal: 3098.55,
    profitMargin: null,
    tax: 216.9,
    taxPercentage: 7,
    grandTotal: 3315.45,
    amountDue: 1024.56,
    invoiceStatus: null,
    prodStatus: "Started",
    prodDueDate: new Date("2023-11-03T04:00:00.000Z"),
    deliveredAt: null,
    deliveryOption: "pickup",
    payments: [
        {
            id: 454,
            customerId: 169,
            transactionId: 358,
            //orderId: 605,
            amount: 2290.89,
            meta: {},
            deletedAt: null,
            createdAt: new Date("2023-11-06T20:23:54.000Z"),
            updatedAt: new Date("2023-11-06T20:23:54.000Z")
        }
    ],
    items: [
        {
            id: 15069,
            description:
                "ph door 2-6 x 6-8 1-3/8 h.c 2pnl caiman smooth primed | frame 4-5/8 | hinge satin nickel | door stop | no casing ",
            productId: null,
            supplier: "MSI 11/02",
            swing: "RH",
            price: 155.14,
            tax: 10.8598,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: {
                tax: "Tax",
                uid: 0,
                produced_qty: 1,
                sales_margin: "Default"
            },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 155.14,
            total: 155.14,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15070,
            description:
                "ph door 2-6 x 6-8 1-3/8 h.c 2pnl caiman smooth primed | frame 4-5/8 | hinge satin nickel | door stop | no casing ",
            productId: null,
            supplier: "MSI 11/02",
            swing: "LH",
            price: 155.14,
            tax: 10.8598,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: {
                tax: "Tax",
                uid: 1,
                produced_qty: 1,
                sales_margin: "Default"
            },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 155.14,
            total: 155.14,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15071,
            description:
                "ph door 2-8 x 6-8 1-3/8 h.c 2pnl caiman smooth primed | frame 4-5/8 | hinge satin nickel | door stop | no casing ",
            productId: null,
            supplier: "MSI 11/02",
            swing: "RH",
            price: 164.25,
            tax: 22.995,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: {
                tax: "Tax",
                uid: 2,
                produced_qty: 2,
                sales_margin: "Default"
            },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 2,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 164.25,
            total: 328.5,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15072,
            description:
                "ph door 2-8 x 6-8 1-3/8 h.c 2pnl caiman smooth primed | frame 4-5/8 | hinge satin nickel | door stop | no casing ",
            productId: null,
            supplier: "MSI 11/02",
            swing: "LH",
            price: 164.25,
            tax: 22.995,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: {
                tax: "Tax",
                uid: 3,
                produced_qty: 2,
                sales_margin: "Default"
            },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 2,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 164.25,
            total: 328.5,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15073,
            description:
                "ph door 2-0 x 6-8 1-3/8 h.c 2pnl caiman smooth primed | frame 4-5/8 | hinge satin nickel | door stop | no casing ",
            productId: null,
            supplier: "MSI 11/02",
            swing: "LH",
            price: 144.98,
            tax: 10.1486,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: {
                tax: "Tax",
                uid: 4,
                produced_qty: 1,
                sales_margin: "Default"
            },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 144.98,
            total: 144.98,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15074,
            description: "BF 5-0 X 6-8 H.C 2PNL CAIMAN SMOOTH PRIMED W/ T & H",
            productId: null,
            supplier: "MSI 11/02",
            swing: "BF ",
            price: 179.25,
            tax: 25.095,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: {
                tax: "Tax",
                uid: 5,
                produced_qty: 2,
                sales_margin: "Default"
            },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 2,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 179.25,
            total: 358.5,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15075,
            description: "BF 3-0 X 6-8 H.C 2PNL CAIMAN SMOOTH PRIMED W/ T & H",
            productId: null,
            supplier: "MSI 11/02",
            swing: "BF",
            price: 109.14,
            tax: 7.639800000000001,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: {
                tax: "Tax",
                uid: 6,
                produced_qty: 1,
                sales_margin: "Default"
            },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 109.14,
            total: 109.14,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15076,
            description: "DOOR 2/4 X 6/8 1-3/8 H.C 2PNL CAIMAN SMOOTH PRIMED",
            productId: null,
            supplier: "MSI 11/02",
            swing: "",
            price: 97.15,
            tax: 6.800500000000001,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: { tax: "Tax", uid: 7, sales_margin: "Default" },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 97.15,
            total: 97.15,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15077,
            description: "DOOR 3/0 X 6/8 1-3/8 H.C 2PNL CAIMAN SMOOTH PRIMED",
            productId: null,
            supplier: "MSI 11/02",
            swing: "",
            price: 117.36,
            tax: 8.215200000000001,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: { tax: "Tax", uid: 8, sales_margin: "Default" },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 117.36,
            total: 117.36,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15078,
            description: "POCKET DOOR FRAME 2/4 X 6/8 W/ HARDWARE ",
            productId: null,
            supplier: "",
            swing: "",
            price: 167.14,
            tax: 11.6998,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: { tax: "Tax", uid: 9, sales_margin: "Default" },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 167.14,
            total: 167.14,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15079,
            description: "POCKET DOOR FRAME 3/0 X 6/8 W/ HARDWARE ",
            productId: null,
            supplier: "MSI 11/02",
            swing: "",
            price: 179.47,
            tax: 12.5629,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: { tax: "Tax", uid: 10, sales_margin: "Default" },
            createdAt: new Date("2023-10-23T23:46:47.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 179.47,
            total: 179.47,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15503,
            description: "add",
            productId: null,
            supplier: null,
            swing: null,
            price: null,
            tax: 10.1486,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: { tax: "Tax", uid: 13, sales_margin: "Default" },
            createdAt: new Date("2023-11-06T20:19:45.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: null,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: null,
            total: 0,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15504,
            description: "2-8 x 6-8 fiberglass caiman with 5-1/4 pvc frame ",
            productId: null,
            supplier: "MSI 11-6",
            swing: null,
            price: 416.87,
            tax: 29.1809,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: { tax: "Tax", uid: 14, sales_margin: "Default" },
            createdAt: new Date("2023-11-06T20:19:45.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 416.87,
            total: 416.87,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15505,
            description:
                "PH DOOR 1-6 X 6-8 1-3/8 H.C 2PNL CAIMAN SMOOTH PRIMED | FRAME 4-5/8 | HINGE SATIN NICKEL | DOOR STOP | NO CASING ",
            productId: null,
            supplier: "MSI 11-6",
            swing: "LH",
            price: 144.98,
            tax: 10.1486,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: { tax: "Tax", uid: 15, sales_margin: "Default" },
            createdAt: new Date("2023-11-06T20:19:45.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 144.98,
            total: 144.98,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        },
        {
            id: 15507,
            description:
                "PH 4-0 X 6-8 1-3/8 H.C BALLCATCH 2PNL SMOOTH PRIMED | FRAME 4-5/8 | HINGE SATIN NICKEL | DOOR STOP | NO CASING ",
            productId: null,
            supplier: "MSI 11-6",
            swing: null,
            price: 395.68,
            tax: 27.6976,
            taxPercenatage: null,
            discount: null,
            discountPercentage: null,
            meta: { tax: "Tax", uid: 16, sales_margin: "Default" },
            createdAt: new Date("2023-11-06T21:08:02.000Z"),
            updatedAt: new Date("2023-11-06T21:23:23.000Z"),
            qty: 1,
            prebuiltQty: null,
            //salesOrderId: 605,
            profitMargin: null,
            rate: 395.68,
            total: 395.68,
            salesPercentage: null,
            prodStatus: null,
            prodStartedAt: null,
            sentToProdAt: null,
            prodCompletedAt: null
        }
    ],
    productions: [
        {
            id: 1493,
            //salesOrderId: 605,
            salesOrderItemId: 15073,
            qty: 1,
            deletedAt: null,
            createdAt: new Date("2023-11-03T14:53:22.000Z"),
            updatedAt: new Date("2023-11-03T14:53:22.000Z"),
            meta: { note: "" }
        },
        {
            id: 1494,
            //salesOrderId: 605,
            salesOrderItemId: 15069,
            qty: 1,
            deletedAt: null,
            createdAt: new Date("2023-11-03T14:58:22.000Z"),
            updatedAt: new Date("2023-11-03T14:58:22.000Z"),
            meta: { note: "" }
        },
        {
            id: 1495,
            //salesOrderId: 605,
            salesOrderItemId: 15070,
            qty: 1,
            deletedAt: null,
            createdAt: new Date("2023-11-03T15:01:18.000Z"),
            updatedAt: new Date("2023-11-03T15:01:18.000Z"),
            meta: { note: "" }
        },
        {
            id: 1496,
            //salesOrderId: 605,
            salesOrderItemId: 15074,
            qty: 2,
            deletedAt: null,
            createdAt: new Date("2023-11-03T15:01:22.000Z"),
            updatedAt: new Date("2023-11-03T15:01:22.000Z"),
            meta: { note: "" }
        },
        {
            id: 1497,
            //salesOrderId: 605,
            salesOrderItemId: 15075,
            qty: 1,
            deletedAt: null,
            createdAt: new Date("2023-11-03T15:01:25.000Z"),
            updatedAt: new Date("2023-11-03T15:01:25.000Z"),
            meta: { note: "" }
        },
        {
            id: 1498,
            //salesOrderId: 605,
            salesOrderItemId: 15072,
            qty: 2,
            deletedAt: null,
            createdAt: new Date("2023-11-03T15:13:25.000Z"),
            updatedAt: new Date("2023-11-03T15:13:25.000Z"),
            meta: { note: "" }
        },
        {
            id: 1499,
            //salesOrderId: 605,
            salesOrderItemId: 15071,
            qty: 2,
            deletedAt: null,
            createdAt: new Date("2023-11-03T15:13:31.000Z"),
            updatedAt: new Date("2023-11-03T15:13:31.000Z"),
            meta: { note: "" }
        }
    ]
};