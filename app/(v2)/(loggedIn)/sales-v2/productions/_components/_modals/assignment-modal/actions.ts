"use server";

import { prisma } from "@/db";
import { DykeDoorType } from "../../../../type";
import { ArrayMetaType, sum } from "@/lib/utils";
import { ISalesOrderItemMeta } from "@/types/sales";

export async function getOrderAssignmentData(id) {
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
                        include: {
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
            console.log(item.meta);

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
                            salesDoor,
                            assignments: subItem.assignments.filter(
                                (a) => a.salesDoorId == salesDoor.id
                            ),
                            doorTitle: salesDoor.housePackageTool.door?.title,
                            report: {
                                assigned: 0,
                                pendingAssignment: 0,
                                completed: 0,
                                totalQty: 0,
                            },
                        };

                        ret.assignments.map((a) => {
                            ret.report.assigned += a.qtyAssigned || 0;
                            ret.report.completed += a.qtyCompleted || 0;
                        });
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
                sectionTitle: item?.meta?.doorType,
                item,
                salesDoors,
                report,
                formSteps: item.formSteps,
            };
        });
    return { ...order, doorGroups };
}
