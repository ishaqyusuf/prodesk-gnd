"use server";

import { prisma } from "@/db";
import { sum } from "@/lib/utils";
import { ISalesOrderItemMeta, ISalesOrderMeta } from "@/types/sales";
import {
    OrderItemProductionAssignments,
    OrderProductionSubmissions,
} from "@prisma/client";

export async function migrationProductions() {
    // const _updates = {};
    // (
    //     await prisma.orderProductionSubmissions.findMany({
    //         include: {
    //             order: {
    //                 select: {
    //                     orderId: true,
    //                 },
    //             },
    //         },
    //     })
    // ).map(async (item) => {
    //     if (!item.lhQty && !item.rhQty && item.qty) {
    //         const k = item.qty?.toString();
    //         if (!_updates[k]) _updates[k] = [];
    //         _updates[k].push(item.id);
    //         // if (item.qty == 80) console.log(item.order);
    //     }
    // });

    // await Promise.all(
    //     Object.entries(_updates).map(async ([k, ids]) => {
    //         await prisma.orderProductionSubmissions.updateMany({
    //             where: {
    //                 id: {
    //                     in: ids as any,
    //                 },
    //             },
    //             data: {
    //                 lhQty: Number(k),
    //             },
    //         });
    //     })
    // );

    // return _updates;
    // return [];

    const notDeleted = {
        deletedAt: null,
    };
    const count = await prisma.salesOrders.count({
        where: {
            isDyke: false,
            prodId: {
                not: null,
            },
            assignments: {
                none: {},
            },
        },
    });
    const orders = (
        await prisma.salesOrders.findMany({
            where: {
                isDyke: false,
                prodId: {
                    not: null,
                },
                assignments: {
                    none: {},
                },
            },
            take: 15,
            include: {
                items: {
                    where: notDeleted,
                    include: {
                        productions: {
                            where: notDeleted,
                        },
                        assignments: {
                            where: notDeleted,
                            include: {
                                submissions: {
                                    where: notDeleted,
                                },
                            },
                        },
                    },
                },
            },
        })
    ).map((order) => {
        return {
            ...order,
            meta: order.meta as any as ISalesOrderMeta,
            items: order.items.map((item) => {
                return {
                    ...item,
                    meta: item.meta as any as ISalesOrderItemMeta,
                };
            }),
        };
    });
    const updateProds: {
        data;
        items: {
            assignment: Partial<OrderItemProductionAssignments>;
            productionIds: number[];
            data;
            submission: Partial<OrderProductionSubmissions>;
        }[];
    }[] = [];
    let deleteProds: any[] = [];
    const updateSubmissions = {};
    orders.map((order) => {
        const completed = order.prodStatus?.toLowerCase() == "completed";
        updateProds.push({
            data: {
                builtQty: order.builtQty || 0,
                prodQty: order.prodQty,
                orderId: order.orderId,
            },
            items: order.items
                .filter((item) => item.swing && !item.assignments.length)
                .map((item) => {
                    let qty, itemQty;
                    qty = itemQty = item.qty as any;
                    let qtyCompleted, qtySubmitted;
                    qtyCompleted = qtySubmitted = sum(
                        item.productions
                            .filter((p) => !p.deletedAt)
                            .map((p) => p.qty)
                    );
                    // let producedQty = item.meta.produced_qty || qtyCompleted;
                    // let prods
                    let prods = item.productions.map(
                        ({ id, qty: submittedQty }) => ({
                            id,
                            submittedQty,
                            update: false,
                        })
                    );
                    const debug = item.id == 15444;
                    if (qtyCompleted > qty) {
                        qtyCompleted = qty;
                    }
                    let sumProds = sum(prods.map((p) => p.submittedQty));
                    if (debug) console.log([sumProds, qtyCompleted, prods]);

                    while (sumProds > qtyCompleted) {
                        let reduced = false;
                        sumProds = sum(prods.map((p) => p.submittedQty));
                        if (debug) {
                            console.log([sumProds, qtyCompleted]);
                        }
                        // if (sumprod > qty)
                        if (sumProds != qtyCompleted)
                            prods = prods
                                .reverse()
                                .map((p) => {
                                    if (p.submittedQty > 0 && !reduced) {
                                        p.submittedQty -= 1;
                                        if (debug) {
                                            console.log(
                                                "reducing",
                                                p.id,
                                                `to ${p.submittedQty}`,
                                                [qtyCompleted, qty]
                                            );
                                        }
                                        p.update = true;
                                        reduced = true;
                                    } else console.log("qty=0");
                                    return p;
                                })
                                .reverse();
                        if (debug) console.log([sumProds, qtyCompleted, prods]);
                        // qtyCompleted -= 1;
                    }
                    if (debug) console.log(prods);

                    const pendingSubmitQty = completed ? qty - qtyCompleted : 0;
                    // while(qtyCompleted)
                    // const prodQty = order.prodQty || 0;
                    // const autoProd = prodQty - qtyCompleted;
                    // if (autoProd > 0) qtyCompleted = autoProd;
                    const updates = prods
                        .filter((p) => p.update && p.submittedQty > 0)
                        .map((p) => {
                            const k = p.submittedQty?.toString();
                            // let d = {
                            //     id: p.id,
                            //     fromQty: item.productions.find(
                            //         (r) => r.id == p.id
                            //     )?.qty,
                            //     toQty: k,
                            //     item: {
                            //         id: item.id,
                            //         itemQty,
                            //         qtySubmitted,
                            //         new: {
                            //             qtyCompleted,
                            //         },
                            //     },
                            // };
                            let d = p.id;
                            if (!updateSubmissions[k])
                                updateSubmissions[k] = [d];
                            else updateSubmissions[k].push(d);
                            return d;
                        });
                    const deletes = prods
                        .filter((p) => p.update && p.submittedQty == 0)
                        .map((p) => {
                            // let dle = {
                            //     itemId: item.id,
                            //     id: p.id,
                            //     fromQty: item.productions.find(
                            //         (r) => r.id == p.id
                            //     )?.qty,
                            // };
                            let dle = p.id;
                            deleteProds.push(dle);
                            return dle;
                        });
                    return {
                        assignment: {
                            assignedById: order.salesRepId,
                            assignedToId: order.prodId as any,
                            dueDate: order.prodDueDate,
                            itemId: item.id,
                            lhQty: item.qty,
                            qtyAssigned: item.qty,
                            orderId: order.id,
                            qtyCompleted: qtyCompleted,
                        },
                        productionIds: item.productions
                            .map((p) => p.id)
                            .filter(
                                (id) =>
                                    deleteProds.findIndex((i) => i == id) < 0
                            ),
                        data: {
                            updates,
                            deletes,
                            // updateStatus: prods.filter((p) => p.update).length
                            //     ? "has-update"
                            //     : "",
                            // description: item.description,
                            // pendingSubmitQty,
                            // submitStatus:
                            //     pendingSubmitQty < 0
                            //         ? "negative"
                            //         : pendingSubmitQty > 0
                            //         ? "positive"
                            //         : "non",
                        },
                        submission:
                            pendingSubmitQty > 0
                                ? {
                                      qty: pendingSubmitQty,
                                      lhQty: pendingSubmitQty,
                                      note: "Completed by admin",
                                      salesOrderId: order.id,
                                      salesOrderItemId: item.id,
                                  }
                                : (null as any),
                    };
                }),
        });
    });
    // console.log(updateProds.length);
    // return;
    if (deleteProds.length)
        await prisma.orderProductionSubmissions.updateMany({
            where: {
                id: {
                    in: deleteProds,
                },
            },
            data: {
                deletedAt: new Date(),
            },
        });
    await Promise.all(
        Object.entries(updateSubmissions).map(async ([k, ids]) => {
            if ((ids as any)?.length)
                await prisma.orderProductionSubmissions.updateMany({
                    where: {
                        id: {
                            in: ids as any,
                        },
                    },
                    data: {
                        qty: Number(k),
                    },
                });
        })
    );
    await Promise.all(
        updateProds
            // .filter((a, i) => i < 20)
            .map((d) => d.items)
            .flat()
            .map(async (data) => {
                console.log("....");
                const assignment =
                    await prisma.orderItemProductionAssignments.create({
                        data: data.assignment as any,
                    });
                console.log("....");
                if (data.productionIds.length)
                    await prisma.orderProductionSubmissions.updateMany({
                        where: {
                            id: {
                                in: data.productionIds,
                            },
                        },
                        data: {
                            assignmentId: assignment.id,
                        },
                    });
                console.log("....");

                if (data.submission)
                    await prisma.orderProductionSubmissions.create({
                        data: {
                            ...data.submission,
                            assignmentId: assignment.id,
                        } as any,
                    });
                console.log("....");
            })
    );
    console.log(updateProds.length);
    console.log(count);
    return { updateProds, count, deleteProds, updateSubmissions };
}
