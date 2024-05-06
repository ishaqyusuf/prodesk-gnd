"use server";

import { prisma } from "@/db";
import { DykeDoorType } from "../../../../../type";
import { ArrayMetaType, sum } from "@/lib/utils";
import { ISalesOrderItemMeta } from "@/types/sales";
import { isComponentType } from "@/app/(v2)/(loggedIn)/sales-v2/overview/is-component-type";
import { OrderItemProductionAssignments } from "@prisma/client";

export async function getOrderAssignmentData(id) {
    // await prisma.orderItemProductionAssignments.updateMany({
    //     data: {
    //         qtyAssigned: 1,
    //     },
    // });
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
                        where: { deletedAt: null },
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
                                    return {
                                        ...assignment,
                                    };
                                }),
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
                            ret.report.assigned += a.qtyAssigned || 0;
                            ret.report.completed += a.qtyCompleted || 0;

                            a.submissions.map((s) => {
                                if (s.leftHandle)
                                    ret.report.lhCompleted += s.qty;
                                else ret.report.rhCompleted += s.qty;
                            });
                        });
                        ret.report.rhPending =
                            ret.report.rhQty - ret.report.rhCompleted;
                        ret.report.lhPending =
                            ret.report.lhQty - ret.report.lhCompleted;

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
                .flat();

            return {
                sectionTitle: item?.meta?.doorType as DykeDoorType,
                isType: isComponentType(item?.meta?.doorType),
                item,
                salesDoors,
                report,
                formSteps: item?.formSteps,
            };
        });
    return { ...order, doorGroups };
}
