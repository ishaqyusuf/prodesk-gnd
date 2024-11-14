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
    const keys = Object.keys(query) as (keyof GetSalesListQuery)[];
    keys.map((k) => {
        if (!query?.[k]) return;
        switch (k) {
            case "id":
                whereAnd.push({
                    id: query.id,
                });
                break;
            case "orderId":
                whereAnd.push({
                    orderId: {
                        contains: query.orderId,
                    },
                });
                break;
            case "po":
                whereAnd.push({
                    meta: {
                        path: "$.po",
                        // equals: query.po,
                        string_contains: query.po,
                    },
                });
                break;
            case "customer":
                whereAnd.push({
                    OR: [
                        {
                            customer: {
                                name: { contains: query.customer },
                            },
                        },
                        {
                            customer: {
                                businessName: { contains: query.customer },
                            },
                        },
                        {
                            billingAddress: {
                                name: { contains: query.customer },
                            },
                        },
                    ],
                });
                break;
            case "phone":
                whereAnd.push({
                    OR: [{ customer: { phoneNo: { contains: query.phone } } }],
                });
            case "rep":
                whereAnd.push({
                    salesRep: {
                        name: query.rep,
                    },
                });
        }
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
export const notDeleted = excludeDeleted;

export const SalesListInclude = {
    producer: true,
    pickup: true,
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

const AssignmentsInclude = {
    where: {
        ...excludeDeleted.where,
        assignedToId: undefined,
    },
    include: {
        assignedTo: true,
        submissions: {
            ...excludeDeleted,
            include: {
                itemDeliveries: {
                    ...excludeDeleted,
                },
            },
        },
    },
} satisfies
    | Prisma.DykeSalesDoors$productionsArgs
    | Prisma.SalesOrderItems$assignmentsArgs;
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
                    productions: AssignmentsInclude,
                },
                where: {
                    doorType: {
                        in: salesData.productionDoorTypes,
                    },
                    ...excludeDeleted.where,
                },
            },
            assignments: AssignmentsInclude,
            shelfItems: {
                where: { deletedAt: null },
                include: {
                    shelfProduct: true,
                },
            },
            housePackageTool: {
                ...excludeDeleted,
                include: {
                    casing: excludeDeleted,
                    door: excludeDeleted,
                    jambSize: excludeDeleted,
                    doors: {
                        ...excludeDeleted,
                    },
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
export const SalesOverviewIncludes = {
    items: {
        where: { deletedAt: null },
        include: {
            formSteps: {
                ...excludeDeleted,
                include: {
                    step: true,
                },
            },
            assignments: AssignmentsInclude,
            shelfItems: {
                where: { deletedAt: null },
                include: {
                    shelfProduct: true,
                },
            },
            housePackageTool: {
                ...excludeDeleted,
                include: {
                    casing: excludeDeleted,
                    door: excludeDeleted,
                    jambSize: excludeDeleted,
                    doors: {
                        ...excludeDeleted,
                        include: {
                            productions: AssignmentsInclude,
                        },
                    },
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
    deliveries: {
        ...excludeDeleted,
        include: {
            items: excludeDeleted,
            driver: true,
        },
    },
    // itemDeliveries: excludeDeleted,
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
