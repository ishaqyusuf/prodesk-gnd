import { Prisma } from "@prisma/client";
import salesData from "./sales-data";
import { ftToIn } from "./sales-utils";
import {
    anyDateQuery,
    withDeleted,
} from "@/app/(clean-code)/_common/utils/db-utils";
import { GetSalesDispatchListQuery } from "../data-access/sales-dispatch-dta";
import {
    FilterKeys,
    FilterParams,
} from "@/components/(clean-code)/data-table/search-params";
export function whereDispatch(query: GetSalesDispatchListQuery) {
    const whereAnd: Prisma.OrderDeliveryWhereInput[] = [];
    return whereAnd.length > 1 ? { AND: whereAnd } : whereAnd[0];
}
export function whereSales(query: FilterParams) {
    const whereAnd: Prisma.SalesOrdersWhereInput[] = [];
    if (query["with.trashed"]) whereAnd.push(withDeleted);
    if (query["trashed.only"])
        whereAnd.push({
            deletedAt: anyDateQuery(),
        });
    const q = query._q;
    if (q) {
        const parsedQ = parseSearchQuery(q);
    }
    if (query["dealer.id"])
        whereAnd.push({
            customer: {
                auth: {
                    id: query["dealer.id"],
                },
            },
        });
    whereAnd.push({
        type: query["sales.type"],
    });
    const keys = Object.keys(query) as FilterKeys[];
    keys.map((k) => {
        if (!query?.[k]) return;
        switch (k) {
            case "id":
                whereAnd.push({
                    id: query.id,
                });
                break;
            case "order.no":
                whereAnd.push({
                    orderId: {
                        contains: query["order.no"],
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
            case "customer.name":
                whereAnd.push({
                    OR: [
                        {
                            customer: {
                                name: {
                                    contains: query["customer.name"],
                                },
                            },
                        },
                        {
                            customer: {
                                businessName: {
                                    contains: query["customer.name"],
                                },
                            },
                        },
                        {
                            billingAddress: {
                                name: {
                                    contains: query["customer.name"],
                                },
                            },
                        },
                    ],
                });
                break;
            case "phone":
                whereAnd.push({
                    OR: [
                        {
                            customer: {
                                phoneNo: { contains: query.phone },
                            },
                        },
                    ],
                });
            case "sales.rep":
                whereAnd.push({
                    salesRep: {
                        name: query["sales.rep"],
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

export const dykeFormIncludes = (restoreQuery) =>
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
export const includeStepPriceCount = {
    select: {
        priceSystem: {
            where: {
                deletedAt: null,
            },
        },
    },
};
export const SalesBookFormIncludes = (restoreQuery) =>
    ({
        salesProfile: true,
        items: {
            where: {
                deletedAt: null,
            },
            include: {
                formSteps: {
                    where: {
                        ...withDeleted,
                        // ...restoreQuery,
                    },

                    include: {
                        priceData: true,
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
                        priceData: true,
                        stepProduct: {
                            include: {
                                door: true,
                            },
                        },
                        doors: {
                            include: {
                                priceData: true,
                            },
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
