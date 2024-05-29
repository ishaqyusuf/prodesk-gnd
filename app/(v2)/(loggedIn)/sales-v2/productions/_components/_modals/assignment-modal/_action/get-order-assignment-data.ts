"use server";

import { prisma } from "@/db";
import { DykeDoorType } from "../../../../../type";
import { ArrayMetaType, sum } from "@/lib/utils";
import { ISalesOrderItemMeta } from "@/types/sales";
import { isComponentType } from "@/app/(v2)/(loggedIn)/sales-v2/overview/is-component-type";
import { OrderItemProductionAssignments } from "@prisma/client";
import { userId } from "@/app/(v1)/_actions/utils";
import getDoorConfig from "@/app/(v2)/(loggedIn)/sales-v2/form/_hooks/use-door-config";
import { composeDoorDetails } from "@/app/(v2)/(loggedIn)/sales-v2/_utils/compose-sales-items";
import salesData from "@/app/(v2)/(loggedIn)/sales/sales-data";

export async function getOrderAssignmentData(id, prod = false) {
    // await prisma.orderItemProductionAssignments.updateMany({
    //     data: {
    //         qtyAssigned: 1,
    //     },
    // });
    const authId = await userId();
    const order = await prisma.salesOrders.findFirst({
        where: { id },
        include: {
            customer: {
                select: {
                    id: true,
                    businessName: true,
                    name: true,
                },
            },
            productionStatus: true,
            items: {
                where: {
                    OR: [
                        {
                            salesDoors: {
                                some: {
                                    doorType: {
                                        in: salesData.productionDoorTypes,
                                    },
                                },
                            },
                        },
                        {
                            swing: {
                                not: null,
                            },
                        },
                        {
                            qty: null,
                            swing: null,
                            salesOrder: {
                                isDyke: false,
                            },
                        },
                        {
                            dykeProduction: true,
                        },
                    ],
                    deletedAt: null,
                },
                include: {
                    formSteps: {
                        include: {
                            step: true,
                        },
                    },
                    salesDoors: {
                        include: {
                            housePackageTool: {
                                include: {
                                    door: true,
                                },
                            },
                        },
                        where: {
                            doorType: {
                                in: ["Garage", "Interior"] as DykeDoorType[],
                            },
                            deletedAt: null,
                        },
                    },
                    assignments: {
                        where: {
                            deletedAt: null,
                            assignedToId: prod ? authId : undefined,
                        },
                        include: {
                            assignedTo: true,
                            submissions: true,
                        },
                    },
                },
            },
        },
    });
    if (!order) throw Error("Not found");
    // const _item = order.items[0];
    const items = ArrayMetaType(order.items, {} as ISalesOrderItemMeta);
    let assignmentSummary = {};
    let doorGroups = items
        .filter(
            (item) =>
                !order.isDyke ||
                (order.isDyke &&
                    (item.multiDyke || (!item.multiDyke && !item.multiDykeUid)))
        )
        .map((item, index) => {
            const _items = order.items.filter(
                (i) =>
                    i.id == item.id ||
                    (item.multiDyke && item.multiDykeUid == i.multiDykeUid)
            );
            const report = {
                assigned: 0,
                pendingAssignment: 0,
                completed: 0,
                totalQty: 0,
            };
            const salesDoors = _items
                .filter((s) => order.isDyke)
                .map((subItem) => {
                    return subItem.salesDoors.map((salesDoor) => {
                        const ret = {
                            salesDoor: {
                                ...salesDoor,
                                itemId: subItem.id,
                                doorType: salesDoor.doorType as DykeDoorType,
                            },
                            assignments: subItem.assignments
                                .filter((a) => a.salesDoorId == salesDoor.id)
                                .map(composeAssignment)
                                .flat()
                                .filter((s) => s.__report.total > 0),
                            doorTitle: salesDoor.housePackageTool.door?.title,
                            report: initJobReport(subItem, salesDoor),
                        };

                        return analyseItem(ret, report);
                    });
                })
                .flat()
                .filter((a) => (prod ? a.assignments?.length : true));
            // if (item.dykeProduction) {
            _items.map((sItem) => {
                if (sItem.dykeProduction) {
                    const ret = {
                        salesDoor: {
                            lhQty: sItem.qty,
                        } as any,
                        assignments: sItem.assignments
                            .filter((a) => a.itemId == sItem.id)
                            .map(composeAssignment)
                            .flat()
                            .filter((s) => s.__report.total > 0),
                        doorTitle: sItem.description as any,
                        report: initJobReport(sItem, { lhQty: sItem.qty }),
                    };

                    salesDoors.push(analyseItem(ret, report));
                }
            });
            if (!order.isDyke) {
                const salesDoor = { lhQty: item.qty, itemId: item.id };
                const ret = {
                    salesDoor,
                    assignments: item.assignments
                        .filter((a) => a.itemId == item.id)
                        .map(composeAssignment)
                        .flat()
                        .filter((s) => s.__report.total > 0),
                    doorTitle: item.description?.toUpperCase(),
                    report: initJobReport(item, salesDoor),
                };
                salesDoors.push(analyseItem(ret, report) as any);
            }
            // console.log(order.isDyke);

            return {
                isDyke: order.isDyke,
                sectionTitle: item?.meta?.doorType as DykeDoorType,
                isType: isComponentType(item?.meta?.doorType),
                doorConfig: getDoorConfig(item?.meta?.doorType),
                item,
                groupItemId: null as any,
                salesDoors,
                report,
                formSteps: item?.formSteps,
                doorDetails: composeDoorDetails(
                    item.formSteps as any,
                    item as any
                ),
            };
        })
        .sort(
            order.isDyke
                ? undefined
                : (item, item2) =>
                      item.item.meta.lineIndex - item2.item.meta.lineIndex
        );
    doorGroups = doorGroups
        .map((group, index) => {
            if (!order.isDyke) {
                const gItem = doorGroups.findLast(
                    (g, i) => !g.item.qty && i < index
                )?.item;
                let title = gItem?.description?.replaceAll("*", "");
                group.sectionTitle = title as any;
                group.groupItemId = gItem?.id;
            }
            return group;
        })
        .filter((item) => order.isDyke || (!order.isDyke && item.item.qty));
    if (doorGroups.filter((dg) => dg.groupItemId).length > 0) {
        const ng = doorGroups.filter(
            (_, i) =>
                !_.groupItemId ||
                (_.groupItemId &&
                    i ==
                        doorGroups.findIndex(
                            (d) => d.groupItemId == _.groupItemId
                        ))
        );
        // console.log(ng.length);
        doorGroups = ng.map((n) => {
            if (n.groupItemId) {
                // n.salesDoors = [
                //     ...n.salesDoors,
                // ]
                doorGroups
                    .filter((g) => g.groupItemId == n.groupItemId)
                    .map((g) => {
                        n.salesDoors.push(...g.salesDoors);
                    });
            }
            console.log(n);

            return {
                ...n,
                salesDoors: n.salesDoors.filter(
                    (s, i) =>
                        i ==
                        n.salesDoors.findIndex(
                            (d) =>
                                d.salesDoor.salesOrderItemId ==
                                s.salesDoor.salesOrderItemId
                        )
                ),
            };
        });
    }
    // console.log(doorGroups);
    // console.log(order.items.length);
    const totalQty = sum(doorGroups.map((d) => d.report.totalQty));
    return { ...order, totalQty, doorGroups, isProd: prod };
}
function analyseItem<T>(_ret: T, report): T {
    let ret: any = { ..._ret };
    ret.assignments.map((a) => {
        ret.report.assigned += a.__report.total || 0;
        ret.report.completed += a.__report.submitted || 0;

        a.submissions.map((s) => {
            if (s.lhQty) ret.report.lhCompleted += s.lhQty;
            if (s.rhQty) ret.report.rhCompleted += s.rhQty;
            // else ret.report.rhCompleted += s.qty;
        });
    });
    ret.report.rhPending = ret.report.rhQty - ret.report.rhCompleted;
    ret.report.lhPending = ret.report.lhQty - ret.report.lhCompleted;
    ["lh", "rh"].map((k) => {
        const _qty = `${k}Qty`;
        ret.report._unassigned[k] =
            ret.report[_qty] - sum(ret.assignments.map((s) => s[_qty]));
    });
    ret.report._assignForm.lhQty = ret.report._unassigned.lh;
    ret.report._assignForm.rhQty = ret.report._unassigned.rh;

    ret.report.totalQty += sum([ret.salesDoor.lhQty, ret.salesDoor.rhQty]);
    ret.report.pendingAssignment = ret.report.totalQty - ret.report.assigned;
    Object.entries(ret.report).map(([k, v]) => (report[k] += v));

    return ret;
}
function composeAssignment(assignment) {
    let splitted = [assignment.lhQty, assignment.rhQty].map((q, i) => {
        const isLeft = i == 0;

        let status = "";
        const r = {
            ...assignment,
            status,
            __report: {
                submissions: assignment.submissions?.filter((s) =>
                    isLeft ? s.lhQty : s.rhQty
                ),
                submitted: sum(
                    assignment.submissions.map((s) =>
                        isLeft ? s.lhQty : s.rhQty
                    )
                ),
                pending: 0,
                handle: isLeft ? "LH" : "RH",
                total: 0,
                isLeft,
            },
            submitted: {
                lh: sum(
                    assignment.submissions
                        // .filter((s) => s.)
                        .map((s) => s.lhQty)
                ),
                rh: sum(assignment.submissions.map((s) => s.rhQty)),
            },
            pending: {
                lh: 0,
                rh: 0,
            },
        };
        r.__report.pending =
            ((isLeft ? r.lhQty : r.rhQty) || 0) - r.__report.submitted;
        r.pending.lh = (r.lhQty || 0) - r.submitted.lh;
        r.pending.rh = (r.rhQty || 0) - r.submitted.rh;
        r.__report.total = r.__report.submitted + r.__report.pending;
        return r;
    });
    return splitted;
}
const initJobReport = (item, sDoor) => ({
    assigned: 0,
    pendingAssignment: 0,
    completed: 0,
    totalQty: 0,
    rhQty: sDoor.rhQty,
    lhQty: sDoor.lhQty,
    rhCompleted: 0,
    rhPending: 0,
    lhPending: 0,
    _unassigned: {
        lh: 0,
        rh: 0,
    },
    _assigned: {
        lh: 0,
        rh: 0,
    },
    lhCompleted: 0,
    _assignForm: {
        lhQty: 0,
        rhQty: 0,
        itemId: item.id,
        salesDoorId: sDoor.id,
        orderId: item.salesOrderId,
    } as Partial<OrderItemProductionAssignments>,
});
