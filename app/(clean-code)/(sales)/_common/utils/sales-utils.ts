import { Prisma, SalesTaxes } from "@prisma/client";
import salesData, { TaxCodes } from "./sales-data";
import { GetSalesListQuery } from "../data-access/sales-list-dta";
import {
    anyDateQuery,
    withDeleted,
} from "@/app/(clean-code)/_common/utils/db-utils";

export function inToFt(_in) {
    let _ft = _in;
    const duo = _ft.split("x");
    if (duo.length == 2) {
        // console.log(_ft);

        return `${inToFt(duo[0]?.trim())} x ${inToFt(duo[1]?.trim())}`;
    }
    try {
        _ft = +_in.split('"')?.[0]?.split("'")[0]?.split("in")?.[0];

        if (_ft > 0) {
            _ft = +_ft;
            const ft = Math.floor(_ft / 12);
            const rem = _ft % 12;

            return `${ft}-${rem}`;
        }
    } catch (e) {}
    return _in;
}
export function ftToIn(h) {
    const [ft, _in] = h
        ?.split(" ")?.[0]
        ?.split("-")
        ?.map((s) => s?.trim())
        .filter(Boolean);
    return `${+_in + +ft * 12}in`;
}
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
export const SalesInclude = {
    // customer: true,
    // shippingAddress: true,
    // billingAddress: true,
    producer: true,
    // salesRep: true,
    pickup: true,
    items: {
        where: {
            swing: {
                not: null,
            },
        },
        select: {
            description: true,
            prebuiltQty: true,
            id: true,
            qty: true,
            swing: true,
            prodCompletedAt: true,
            dykeProduction: true,
            meta: true,
        },
    },
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
    assignments: {
        where: {
            deletedAt: null,
            item: {
                deletedAt: null,
            },
        },
        include: {
            assignedTo: {
                select: {
                    name: true,
                    id: true,
                },
            },
            salesDoor: {
                select: {
                    id: true,
                    housePackageTool: {
                        select: {
                            door: {
                                select: {
                                    id: true,
                                    title: true,
                                    img: true,
                                },
                            },
                        },
                    },
                },
            },
            submissions: {
                where: {
                    deletedAt: null,
                },
                select: {
                    id: true,
                    qty: true,
                    rhQty: true,
                    lhQty: true,
                },
            },
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
} satisfies Prisma.SalesOrdersInclude;

export function taxByCode(taxes: SalesTaxes[]) {
    const a: { [code in TaxCodes]: SalesTaxes } = {} as any;
    salesData.salesTaxes.map((t) => {
        const tax = taxes.find((_t) => _t.taxCode == t.code);
        a[t.code] = {
            ...(tax || {}),
            taxCode: t.code,
        } as any;
    });
    return a;
}
