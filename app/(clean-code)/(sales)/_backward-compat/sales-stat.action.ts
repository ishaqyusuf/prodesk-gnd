"use server";

import { prisma } from "@/db";
import { SalesIncludeAll } from "../_common/utils/db-utils";
import { TypedSalesStat } from "../types";
import { GetFullSalesDataDta } from "../_common/data-access/sales-dta";
import { percent, sum } from "@/lib/utils";
import { statStatus } from "../_common/utils/sales-utils";
import { OrderItemProductionAssignments } from "@prisma/client";
import { AsyncFnType } from "../../type";

async function loadSales() {
    const sales = await prisma.salesOrders.findMany({
        where: {
            type: "order",
            stat: {
                none: {},
            },
        },
        include: SalesIncludeAll,
    });
    return sales;
}
type LoadedSales = AsyncFnType<typeof loadSales>;
export async function salesStatisticsAction() {
    const sales = await loadSales();
    const stats: Partial<TypedSalesStat>[] = [];
    let resps: any = {
        stats: [] as Partial<TypedSalesStat>[],
        delivered: [],
        salesResps: [],
    };
    sales.map((s) => {
        const r = productionStats(s as any);
        r.stats.map((stat) => {
            stat.salesId = s.id;
            stat.percentage = percent(stat.score, stat.total);
            stat.status = statStatus(stat.percentage);
            stats.push(stat);
        });
        if (r.deliveryStats.length)
            resps.delivered.push({
                orderId: s.orderId,
                ...r.deliveryStats[0],
            });
        resps.salesResps.push(r);
    });
    console.log(stats.length);
    // await prisma.salesStat.createMany({
    //     data: stats as any,
    // });
    function statBy(k) {
        const res: any = {};
        Array.from(new Set(sales.map((s) => s[k]))).map((r) => {
            res[r || "null"] = sales.filter((s) => s[k] == r).length;
        });
        return res;
    }
    resps = {
        ...resps,
        allSales: sales.length,
        resps,
        statusList: Array.from(new Set(sales.map((s) => s.status))),
        prodStatuList: Array.from(new Set(sales.map((s) => s.prodStatus))),
        withProducers: sales.filter((s) => s.producer?.id).length,
        dykeWithProducers: sales.filter((s) => s.producer?.id && s.isDyke)
            .length,
        statistics: {
            status: statBy("status"),
            prod: statBy("prodStatus"),
        },
    };
    return resps;
}
function productionStats(order: LoadedSales[number]) {
    // get total produceables
    let totalProds = 0;
    let completedProds = 0;
    let assignedProd = 0;
    let delivered = 0;
    const resp = {
        stats: [] as Partial<TypedSalesStat>[],
        deliveryStats: [],
        withDeliveries: [],
        prods: [],
        assignments: [] as Partial<OrderItemProductionAssignments>[],
    };
    const isDelivered =
        order.deliveredAt || order.status?.toLowerCase() == "delivered";
    const prodId = order.producer?.id;
    order.items.map((item) => {
        function registerAssignment(totalQty, salesDoorId?) {
            resp.assignments.push({
                itemId: item.id,
                orderId: order.id,
                qtyAssigned: totalQty,
                assignedToId: prodId,
                assignedById: 1,
                salesDoorId,
            });
        }
        let totalItems = 0;
        if (order.isDyke) {
            if (item.dykeProduction) totalItems += item.qty;
            item.salesDoors.map((sd) => {
                // sd.totalQty
                const q = sum([sd.lhQty, sd.rhQty]);
                const q2 = sum([sd.totalQty]);
                // if (q2 != q) {
                // console.log({ q, q2 });
                // }
                totalItems += q;
            });
        } else {
            if (item.swing || item.assignments.length)
                totalItems += Number(item.qty);
            if (prodId && !item.assignments?.length) {
                if (item.dykeProduction) {
                    registerAssignment(totalItems);
                }
                item.salesDoors.map(({ id, totalQty, lhQty, rhQty }) => {
                    console.log({ totalQty, lhQty, rhQty });
                    registerAssignment(totalQty, id);
                });
            }
        }
        if (item.swing || item.assignments.length) {
            totalProds += Number(item.qty);
            assignedProd += item.assignments
                .map(({ lhQty, rhQty, qtyAssigned, submissions }) => {
                    const s1 = sum([lhQty, rhQty]);
                    const s2 = sum([qtyAssigned]);

                    completedProds += submissions
                        .map((a) => {
                            const s1 = sum([a.lhQty, a.rhQty]);
                            const s2 = sum([a.qty]);
                            return s2;
                        })
                        .filter((s) => s > 0)
                        .reduce((a, b) => a + b, 0);

                    return s2;
                })
                .filter((s) => s > 0)
                .reduce((a, b) => a + b, 0);
            if (prodId && !item.assignments?.length) {
                console.log("REGISTERING OLD SALE");
                registerAssignment(totalItems);
                // resp.assignments.push({
                //     itemId: item.id,
                //     orderId: order.id,
                //     qtyAssigned: totalItems,
                //     assignedToId: prodId,
                //     assignedById: 1,
                // });
            }
        }
        totalProds += totalItems;
    });

    resp.stats = [
        {
            total: totalProds,
            type: "prod",
            score: completedProds,
        },
        {
            total: totalProds,
            type: "prodAssignment",
            score: assignedProd,
        },
        {
            total: totalProds,
            score: delivered,
            type: "dispatch",
        },
    ];
    return resp;
}
