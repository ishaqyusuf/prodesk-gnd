"use server";

import { TruckLoaderForm } from "@/components/sales/load-delivery/load-delivery";
import { deepCopy } from "@/lib/deep-copy";
import { convertToNumber, toFixed } from "@/lib/use-number";
import { IBackOrderForm, ISalesOrder, ISalesOrderItem } from "@/types/sales";
import { SalesPayments } from "@prisma/client";

interface BackOrderData {
    newOrder: {
        data: Partial<ISalesOrder>;
        items: Partial<ISalesOrderItem>[];
        applyPayment: { [id in number]: { amount: number } };
        newPayment: { amount: number };
    };
    oldOrder: {
        update: Partial<ISalesOrder>;
        updateItems: { [id in number]: Partial<ISalesOrderItem> }[];
        updatePayments: { [id in number]: Partial<SalesPayments> };
    };
}
export async function _createSalesBackOrder(
    order: ISalesOrder,
    backOrderForm: TruckLoaderForm
) {
    const form = backOrderForm.loader[order.slug];
    let data: BackOrderData = ({
        newOrder: {
            items: []
        },
        oldOrder: {}
    } as any) as BackOrderData;
    const oldOrder = { ...order };
    const {
        orderId: oldOrderId,
        id,
        //    status,
        slug,
        // amountDue,
        invoiceStatus,
        //    prodStatus,
        //    prodId,
        // salesRepId,
        builtQty,
        createdAt,
        updatedAt,
        //    goodUntil,
        //    deliveredAt,
        //    paymentTerm,
        //    inventoryStatus,
        items,
        payments,
        ...newOrderData
    } = order;

    let {
        sales_percentage: profitRate,
        profileEstimate,
        mockupPercentage: mockPercentage
    } = order.meta;
    let orderUpdate = ({
        subTotal: 0,
        tax: 0,
        grandTotal: 0,
        meta: {
            ...(order.meta as any),
            ccc: 0
        }
    } as any) as ISalesOrder;
    newOrderData.grandTotal = newOrderData.subTotal = newOrderData.tax = newOrderData.meta.ccc = 0;

    let taxPercentage = order.taxPercentage || 0;
    let cccPercentage = orderUpdate.meta.ccc_percentage;
    data.newOrder.data = newOrderData;
    data.oldOrder.update = orderUpdate;
    // let taxxables = 0;
    let d = {
        new: {
            taxxable: 0
        },
        old: {
            taxxable: 0,

            prod: {
                produced: 0,
                total: 0
            },
            itemUpdates: {}
        }
    };
    let __: any = {};
    let newItems = deepCopy<ISalesOrderItem[]>(items)
        ?.map(({ id, salesOrderId, prebuiltQty, truckLoadQty, ...newItem }) => {
            let oldTotal = newItem.total;
            let loadQty =
                form?.loadedItems[newItem.meta.uid]?.loadQty || (0 as any);
            const bo = form?.backOrders[newItem.meta.uid];
            if (!bo?.backQty) {
                if (newItem.meta.tax == "Tax" && taxPercentage)
                    d.old.taxxable += newItem.total || 0;
                (orderUpdate.subTotal as any) += newItem.total || 0;
                console.log({
                    sub: orderUpdate.subTotal,
                    taxxable: d.old.taxxable
                });
                if (!bo?.checked) return null;
            }
            if (!newItem.total && bo.checked) {
                // no price update
                console.log(newItem);
                return newItem;
            }
            if (bo.backQty || bo.checked) {
                // if (!newItem.total || (newItem.total && bo.backQty)) {
                if (!bo.backQty) bo.backQty = 0;
                newItem.qty = bo.backQty;

                newItem.total = +toFixed(newItem.qty * (newItem.rate || 0));
                let _qty = loadQty - bo.backQty;

                let itemUpdate: ISalesOrderItem = {
                    meta: {
                        ...(newItem.meta as any)
                    }
                } as any;

                itemUpdate.total = +toFixed(_qty * (newItem.rate || 0));
                if (bo.backQty == 0) {
                    console.log({
                        ...bo,
                        _qty,
                        total: itemUpdate.total,
                        newTotal: newItem.total,
                        oldTotal,
                        loadQty
                    });
                }
                itemUpdate.qty = loadQty as any;
                itemUpdate.updatedAt = new Date();
                const pq = newItem.meta.produced_qty || 0;
                __[id] = {
                    old: oldTotal,
                    update: itemUpdate.total,
                    new: newItem.total
                    // ...bo
                };
                if (newItem.swing) {
                    if (pq == bo.qty) {
                        itemUpdate.meta.produced_qty = _qty;
                        newItem.meta.produced_qty = bo.backQty;
                    } else if (pq > 0 && pq != bo.qty) {
                        let npq = (itemUpdate.meta.produced_qty = Math.min(
                            pq,
                            _qty
                        ));
                        newItem.meta.produced_qty = pq - npq;
                    }
                    // d.old.prod.produced += itemUpdate.meta.produced_qty || 0;
                    // d.old.prod.total += _qty || 0;
                }
                // if (!orderUpdate.subTotal)orderUpdate.subTotal = 0;
                (orderUpdate.subTotal as any) += itemUpdate.total || 0;

                (newOrderData.subTotal as any) += newItem.total;
                if (newItem.meta.tax == "Tax" && taxPercentage) {
                    d.old.taxxable += itemUpdate.total;
                    d.new.taxxable += newItem.total;
                    itemUpdate.tax = itemUpdate.total * (taxPercentage / 100);
                    newItem.tax = newItem.total * (taxPercentage / 100);
                    if (bo.backQty == 0) {
                    }
                }
                d.old.itemUpdates[id] = itemUpdate;
                return newItem;
            }
            return null;
        })
        .filter(Boolean);
    // __ = {
    //     d,
    //     orderUpdate,
    //     newOrderData
    // };
    let laborCost = convertToNumber(order.meta.labor_cost, 0);
    let { labor1, labor2 } = calculateLaborCosts(
        newOrderData.subTotal,
        orderUpdate.subTotal,
        laborCost
    );
    newOrderData.meta.labor_cost = labor1;
    orderUpdate.meta.labor_cost = labor2;
    let newSubTotal = +toFixed(newOrderData.subTotal + labor1);
    let oldSubTotal = +toFixed(orderUpdate.subTotal + labor2);
    if (order.meta.ccc > 0) {
        let { labor1, labor2 } = calculateLaborCosts(
            newOrderData.subTotal,
            orderUpdate.subTotal,
            order.meta.ccc
        );
        newOrderData.meta.ccc = labor1;
        orderUpdate.meta.ccc = labor2;
    }
    if (taxPercentage > 0) {
        if (d.new.taxxable > 0) {
            newOrderData.tax = +toFixed(d.new.taxxable * (taxPercentage / 100));
        }
        if (d.old.taxxable) {
            orderUpdate.tax = +toFixed(d.old.taxxable * (taxPercentage / 100));
        }
    }
    orderUpdate.grandTotal = +toFixed(
        orderUpdate.meta.ccc + orderUpdate.tax + oldSubTotal
    );
    newOrderData.grandTotal = +toFixed(
        newOrderData.meta.ccc + newOrderData.tax + newSubTotal
    );

    let amountDue = newOrderData.amountDue || 0;
    let updatePayment = {
        transfer: [] as any,
        update: {},
        create: {},
        newPaid: 0
    };
    if (amountDue > 0) {
        let boTotal = newOrderData.grandTotal;
        let oldTotal = orderUpdate.grandTotal;
        if (amountDue >= boTotal) {
            newOrderData.amountDue = boTotal;
            orderUpdate.amountDue = amountDue - boTotal;
            __ = { newOrderData, orderUpdate };
        } else {
            newOrderData.amountDue = amountDue;
            orderUpdate.amountDue = 0;
            let backPayment = newOrderData.grandTotal - amountDue;

            let bal = backPayment;
            order.payments?.map(p => {
                if (bal == 0) return;
                let nP = p.amount - bal;

                if (nP < 0) {
                    updatePayment.transfer.push({
                        id: p.id,
                        amount: p.amount
                    });
                    bal -= p.amount;
                } else {
                    updatePayment.update[p.id] = { amount: nP };
                    updatePayment.create = {
                        amount: bal
                    };
                    bal = 0;
                }
            });
            updatePayment.newPaid = backPayment - bal;
        }
    }
    let resp = {
        item: __,
        grandTotal: oldOrder.grandTotal,
        due: oldOrder.amountDue,
        tax: oldOrder.tax,
        subTotal: oldOrder.subTotal,
        ccc: oldOrder.meta?.ccc,
        update: {
            grandTotal: orderUpdate.grandTotal,
            due: orderUpdate.amountDue,
            tax: orderUpdate.tax,
            subTotal: orderUpdate.subTotal,
            ccc: orderUpdate.meta?.ccc
        },
        new: {
            grandTotal: newOrderData.grandTotal,
            due: newOrderData.amountDue,
            tax: newOrderData.tax,
            subTotal: newOrderData.subTotal,
            ccc: newOrderData.meta?.ccc
        }
    } as any;
    resp = {
        ...resp,
        sum: {
            due: resp.new.due + resp.update.due,
            tax: resp.new.tax + resp.update.tax,
            ccc: resp.new.ccc + resp.update.ccc,
            subTotal: resp.new.subTotal + resp.update.subTotal,
            grandTotal: resp.new.grandTotal + resp.update.grandTotal
        }
    };
    resp.diff = {
        due: resp.sum.due - resp.due,
        tax: resp.sum.tax - resp.tax,
        ccc: resp.sum.ccc - resp.ccc,
        subTotal: resp.sum.subTotal - resp.subTotal,
        grandTotal: resp.sum.grandTotal - resp.grandTotal
    };
    return resp;
    // return __;
    // return { newOrderData, orderUpdate, d, newItems, order };
}
function calculateLaborCosts(subTotal1, subTotal2, labelCost) {
    // Validate that subTotal2 is not zero to avoid division by zero
    if (subTotal2 === 0) {
        return { labor1: labelCost, labor2: 0 };
    }
    if (subTotal1 == 0) return { labor2: labelCost, labor1: 0 };

    // Calculate the ratio
    const ratio = subTotal1 / subTotal2;

    // Calculate labor costs based on the ratio
    const labor1 = (labelCost * ratio) / 3; // Adjusted ratio for labor1
    const labor2 = labelCost * ratio * (2 / 3); // Adjusted ratio for labor2

    // Return the result as an object
    return { labor1, labor2 };
}
