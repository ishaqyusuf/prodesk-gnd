import { Prisma } from "@prisma/client";
import salesData from "./sales-data";
import { ftToIn } from "./sales-utils";
import {
    anyDateQuery,
    whereNotTrashed,
    withDeleted,
} from "@/app/(clean-code)/_common/utils/db-utils";
import { GetSalesDispatchListQuery } from "../data-access/sales-dispatch-dta";
import {
    FilterKeys,
    FilterParams,
} from "@/components/(clean-code)/data-table/search-params";
import { SalesStatType } from "../../types";
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
    const q = query.search;
    if (q) {
        const searchQ = whereSearch(q);
        if (searchQ) whereAnd.push(searchQ);
    }
    if (query["dealer.id"])
        whereAnd.push({
            customer: {
                auth: {
                    id: query["dealer.id"],
                },
            },
        });
    const statType = (type: SalesStatType) => type;

    if (query["dispatch.status"]) {
        switch (query["dispatch.status"]) {
            case "backorder":
                whereAnd.push({
                    stat: {
                        some: {
                            type: statType("dispatch"),
                            AND: [
                                {
                                    percentage: {
                                        gt: 0,
                                    },
                                },
                                {
                                    percentage: {
                                        lt: 100,
                                    },
                                },
                            ],
                        },
                    },
                });
                break;
        }
    }
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
export function parseSearchQuery(_query) {
    let itemSearch = null;
    if (_query?.startsWith("item:")) {
        itemSearch = _query.split("item:")[1]?.trim();
        // return {
        //     itemSearch,
        // };
    }
    if (!itemSearch) return null;
    const sizePattern = /\b(\d+-\d+)\s*x\s*(\d+-\d+)\b/;
    const match = itemSearch.match(sizePattern);

    let size = "";
    let otherQuery = itemSearch;

    if (match) {
        size = match[0];
        otherQuery = itemSearch.replace(sizePattern, "").trim();
    }
    const spl = size.trim().split(" ");
    if (size && spl.length == 3) {
        size = `${ftToIn(spl[0])} x ${ftToIn(spl[2])}`;
    }

    return {
        size: size,
        otherQuery: otherQuery,
        originalQuery: itemSearch,
    };
}
function whereSearch(query): Prisma.SalesOrdersWhereInput | null {
    const inputQ = { contains: query || undefined } as any;
    const parsedQ = parseSearchQuery(query);
    if (parsedQ) {
        return {
            items: {
                some: {
                    OR: [
                        { description: query },
                        { description: parsedQ.otherQuery },
                        {
                            salesDoors: {
                                some: {
                                    dimension: parsedQ.size
                                        ? {
                                              contains: parsedQ.size,
                                          }
                                        : undefined,
                                },
                            },
                            housePackageTool: {
                                OR: [
                                    {
                                        door: {
                                            title: {
                                                contains: parsedQ.otherQuery,
                                            },
                                        },
                                    },
                                    {
                                        molding: {
                                            title: {
                                                contains: parsedQ.otherQuery,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        };
    }
    if (query) {
        return {
            OR: [
                { orderId: inputQ },
                {
                    customer: {
                        OR: [
                            {
                                businessName: inputQ,
                            },
                            {
                                name: inputQ,
                            },
                            {
                                email: inputQ,
                            },
                            {
                                phoneNo: inputQ,
                            },
                        ],
                    },
                },
                {
                    billingAddress: {
                        OR: [
                            { address1: inputQ },
                            {
                                phoneNo: inputQ,
                            },
                        ],
                    },
                },
                {
                    producer: {
                        name: inputQ,
                    },
                },
            ],
        };
    }
    return null;
}
export const excludeDeleted = {
    where: { deletedAt: null },
};
export const notDeleted = excludeDeleted;

export const SalesListInclude = {
    producer: true,
    pickup: true,
    deliveries: {
        select: {
            id: true,
        },
    },
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
    taxes: excludeDeleted,
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
                    stepProduct: {
                        include: {
                            door: true,
                        },
                    },
                },
            },
        },
    },
    itemControls: true,
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
                        // ...withDeleted,
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
                                stepProduct: true,
                            },
                            where: {
                                ...whereNotTrashed.where,
                                ...restoreQuery,
                            },
                        },
                        door: {
                            where: {
                                ...restoreQuery,
                            },
                            include: {
                                stepProducts: true,
                            },
                        },
                        molding: {
                            where: {
                                ...restoreQuery,
                            },
                            // include: {
                            //     stepProducts: true,
                            // },
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
