"use server";

import { prisma } from "@/db";
import { DykeDoorType } from "../../../../../type";
import { ArrayMetaType, sum } from "@/lib/utils";
import { ISalesOrderItemMeta } from "@/types/sales";
import { isComponentType } from "@/app/(v2)/(loggedIn)/sales-v2/overview/is-component-type";
import { OrderItemProductionAssignments } from "@prisma/client";
import { userId } from "@/app/(v1)/_actions/utils";
import getDoorConfig from "@/app/(v2)/(loggedIn)/sales-v2/form/_hooks/use-door-config";

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
                    salesDoors: {
                        some: {
                            doorType: {
                                in: ["Garage", "Interior"] as DykeDoorType[],
                            },
                        },
                    },
                    deletedAt: null,
                },
                include: {
                    formSteps: true,
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
    const doorGroups = items
        .filter(
            (item) => item.multiDyke || (!item.multiDyke && !item.multiDykeUid)
        )
        .map((item) => {
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
                .map((subItem) => {
                    return subItem.salesDoors.map((salesDoor) => {
                        const ret = {
                            salesDoor: {
                                ...salesDoor,
                                doorType: salesDoor.doorType as DykeDoorType,
                            },

                            assignments: subItem.assignments
                                .filter((a) => a.salesDoorId == salesDoor.id)
                                .map((assignment) => {
                                    // console.log([
                                    //     assignment.lhQty,
                                    //     assignment.rhQty,
                                    // ]);

                                    let splitted = [
                                        assignment.lhQty,
                                        assignment.rhQty,
                                    ].map((q, i) => {
                                        const isLeft = i == 0;

                                        let status = "";
                                        const r = {
                                            ...assignment,
                                            status,
                                            __report: {
                                                submissions:
                                                    assignment.submissions?.filter(
                                                        (s) =>
                                                            isLeft
                                                                ? s.lhQty
                                                                : s.rhQty
                                                    ),
                                                submitted: sum(
                                                    assignment.submissions.map(
                                                        (s) =>
                                                            isLeft
                                                                ? s.lhQty
                                                                : s.rhQty
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
                                                rh: sum(
                                                    assignment.submissions.map(
                                                        (s) => s.rhQty
                                                    )
                                                ),
                                            },
                                            pending: {
                                                lh: 0,
                                                rh: 0,
                                            },
                                        };
                                        r.__report.pending =
                                            ((isLeft ? r.lhQty : r.rhQty) ||
                                                0) - r.__report.submitted;
                                        r.pending.lh =
                                            (r.lhQty || 0) - r.submitted.lh;
                                        r.pending.rh =
                                            (r.rhQty || 0) - r.submitted.rh;
                                        r.__report.total =
                                            r.__report.submitted +
                                            r.__report.pending;
                                        return r;
                                    });
                                    return splitted;
                                })
                                .flat()
                                .filter((s) => s.__report.total > 0),
                            doorTitle: salesDoor.housePackageTool.door?.title,
                            report: {
                                assigned: 0,
                                pendingAssignment: 0,
                                completed: 0,
                                totalQty: 0,
                                rhQty: salesDoor.rhQty,
                                lhQty: salesDoor.lhQty,
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
                                    itemId: subItem.id,
                                    salesDoorId: salesDoor.id,
                                    orderId: subItem.salesOrderId,
                                } as Partial<OrderItemProductionAssignments>,
                            },
                        };

                        ret.assignments.map((a) => {
                            ret.report.assigned += a.__report.total || 0;
                            ret.report.completed += a.__report.submitted || 0;

                            a.submissions.map((s) => {
                                if (s.lhQty) ret.report.lhCompleted += s.lhQty;
                                if (s.rhQty) ret.report.rhCompleted += s.rhQty;
                                // else ret.report.rhCompleted += s.qty;
                            });
                        });
                        ret.report.rhPending =
                            ret.report.rhQty - ret.report.rhCompleted;
                        ret.report.lhPending =
                            ret.report.lhQty - ret.report.lhCompleted;
                        ["lh", "rh"].map((k) => {
                            const _qty = `${k}Qty`;
                            ret.report._unassigned[k] =
                                ret.report[_qty] -
                                sum(ret.assignments.map((s) => s[_qty]));
                        });
                        ret.report._assignForm.lhQty =
                            ret.report._unassigned.lh;
                        ret.report._assignForm.rhQty =
                            ret.report._unassigned.rh;

                        ret.report.totalQty += sum([
                            ret.salesDoor.lhQty,
                            ret.salesDoor.rhQty,
                        ]);
                        ret.report.pendingAssignment =
                            ret.report.totalQty - ret.report.assigned;
                        Object.entries(ret.report).map(
                            ([k, v]) => (report[k] += v)
                        );

                        return ret;
                    });
                })
                .flat()
                .filter((a) => (prod ? a.assignments?.length : true));

            return {
                sectionTitle: item?.meta?.doorType as DykeDoorType,
                isType: isComponentType(item?.meta?.doorType),
                doorConfig: getDoorConfig(item?.meta?.doorType),
                item,
                salesDoors,
                report,
                formSteps: item?.formSteps,
            };
        });
    console.log(doorGroups);

    const totalQty = sum(doorGroups.map((d) => d.report.totalQty));
    return { ...order, totalQty, doorGroups, isProd: prod };
}
