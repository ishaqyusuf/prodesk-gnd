import { Prisma } from "@prisma/client";
import salesData from "./sales-data";
import { ftToIn } from "./sales-utils";
import { GetSalesListQuery } from "../data-access/sales-dta";
import {
    anyDateQuery,
    withDeleted,
} from "@/app/(clean-code)/_common/utils/db-utils";

export function whereSales(query: GetSalesListQuery) {
    const whereAnd: Prisma.SalesOrdersWhereInput[] = [];
    if (query.withTrashed) whereAnd.push(withDeleted);
    if (query.trashedOnly)
        whereAnd.push({
            deletedAt: anyDateQuery(),
        });
    const q = query._q;
    if (q) {
        const parsedQ = parseSearchQuery(q);
    }
    if (query.dealerId)
        whereAnd.push({
            customer: {
                auth: {
                    id: query.dealerId,
                },
            },
        });
    whereAnd.push({
        type: query._type,
    });
    const where: Prisma.SalesOrdersWhereInput =
        whereAnd.length > 1
            ? {
                  AND: whereAnd,
              }
            : {
                  ...(whereAnd[0] || {}),
              };

    return where;
}
export function parseSearchQuery(query) {
    if (!query) return null;
    const sizePattern = /\b(\d+-\d+)\s*x\s*(\d+-\d+)\b/;
    const match = query.match(sizePattern);

    let size = "";
    let otherQuery = query;

    if (match) {
        size = match[0];
        otherQuery = query.replace(sizePattern, "").trim();
    }
    const spl = size.trim().split(" ");
    if (size && spl.length == 3) {
        size = `${ftToIn(spl[0])} x ${ftToIn(spl[2])}`;
    }

    return {
        size: size,
        otherQuery: otherQuery,
        originalQuery: query,
    };
}
export const excludeDeleted = {
    where: { deletedAt: null },
};

export const SalesListInclude = {
    // customer: true,
    // shippingAddress: true,
    // billingAddress: true,
    producer: true,
    // salesRep: true,
    pickup: true,
    // items: {
    //     where: {
    //         swing: {
    //             not: null,
    //         },
    //     },
    //     select: {
    //         description: true,
    //         prebuiltQty: true,
    //         id: true,
    //         qty: true,
    //         swing: true,
    //         prodCompletedAt: true,
    //         dykeProduction: true,
    //         meta: true,
    //     },
    // },
    // items: {
    //     where: {
    //         deletedAt: null,
    //         swing: { not: null },
    //     },
    // },
    // productionStatus: true,
    doors: {
        where: {
            deletedAt: null,
            housePackageTool: {
                doorType: {
                    in: salesData.productionDoorTypes,
                },
            },
        },
        select: {
            id: true,
            doorType: true,
            lhQty: true,
            rhQty: true,
            totalQty: true,
        },
    },
    // assignments: {
    //     where: {
    //         deletedAt: null,
    //         item: {
    //             deletedAt: null,
    //         },
    //     },
    //     include: {
    //         assignedTo: {
    //             select: {
    //                 name: true,
    //                 id: true,
    //             },
    //         },
    //         salesDoor: {
    //             select: {
    //                 id: true,
    //                 housePackageTool: {
    //                     select: {
    //                         door: {
    //                             select: {
    //                                 id: true,
    //                                 title: true,
    //                                 img: true,
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         submissions: {
    //             where: {
    //                 deletedAt: null,
    //             },
    //             select: {
    //                 id: true,
    //                 qty: true,
    //                 rhQty: true,
    //                 lhQty: true,
    //             },
    //         },
    //     },
    // },
    customer: {
        select: {
            id: true,
            businessName: true,
            name: true,
            phoneNo: true,
            email: true,
        },
    },
    billingAddress: {
        select: {
            id: true,
            name: true,
            address1: true,
            email: true,
            meta: true,
            phoneNo: true,
        },
    },
    shippingAddress: {
        select: {
            id: true,
            name: true,
            phoneNo: true,
            email: true,
            meta: true,
            address1: true,
        },
    },
    salesRep: {
        select: {
            id: true,
            name: true,
        },
    },
    stat: true,
} satisfies Prisma.SalesOrdersInclude;
export const SalesIncludeAll = {
    items: {
        where: { deletedAt: null },
        include: {
            formSteps: {
                ...excludeDeleted,
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
                        in: salesData.productionDoorTypes,
                    },
                    ...excludeDeleted.where,
                },
            },
            assignments: {
                where: {
                    ...excludeDeleted.where,
                    assignedToId: undefined,
                },
                include: {
                    assignedTo: true,
                    submissions: {
                        include: {
                            itemDeliveries: true,
                        },
                        ...excludeDeleted,
                    },
                },
            },
            shelfItems: {
                where: { deletedAt: null },
                include: {
                    shelfProduct: true,
                },
            },
            // formSteps: {
            //     where: { deletedAt: null },
            //     include: {
            //         step: {
            //             select: {
            //                 id: true,
            //                 title: true,
            //                 value: true,
            //             },
            //         },
            //     },
            // },
            housePackageTool: {
                ...excludeDeleted,
                include: {
                    casing: excludeDeleted,
                    door: excludeDeleted,
                    jambSize: excludeDeleted,
                    doors: excludeDeleted,
                    molding: excludeDeleted,
                },
            },
        },
    },
    customer: excludeDeleted,
    shippingAddress: excludeDeleted,
    billingAddress: excludeDeleted,
    producer: excludeDeleted,
    salesRep: excludeDeleted,
    productions: excludeDeleted,
    payments: excludeDeleted,
    stat: excludeDeleted,
    deliveries: excludeDeleted,
    itemDeliveries: excludeDeleted,
} satisfies Prisma.SalesOrdersInclude;

export const dykeFormIncludes = (restoreQuery, includeStepPriceCount) =>
    ({
        items: {
            where: {
                ...restoreQuery,
            },
            include: {
                formSteps: {
                    where: {
                        ...restoreQuery,
                    },
                    include: {
                        step: {
                            include: {
                                _count: includeStepPriceCount,
                            },
                        },
                    },
                },
                shelfItems: {
                    where: {
                        ...restoreQuery,
                    },
                },
                housePackageTool: {
                    // where: {
                    //     ...restoreQuery
                    // },
                    include: {
                        stepProduct: {
                            include: {
                                door: true,
                            },
                        },
                        doors: {
                            where: {
                                ...restoreQuery,
                            },
                        },
                        door: {
                            where: {
                                ...restoreQuery,
                            },
                        },
                        molding: {
                            where: {
                                ...restoreQuery,
                            },
                        },
                    },
                },
            },
        },
        payments: true,
        salesRep: {
            select: {
                id: true,
                name: true,
            },
        },
        taxes: {
            where: {
                deletedAt: null,
            },
        },
        customer: true,
        shippingAddress: true,
        billingAddress: true,
    } satisfies Prisma.SalesOrdersInclude);
