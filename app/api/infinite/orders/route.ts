import { getSalesOrdersDta } from "@/app/(clean-code)/(sales)/_common/data-access/sales-dta";
import { SalesType } from "@/app/(clean-code)/(sales)/types";

import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import { generateRandomString } from "@/lib/utils";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const _search: Map<string, string> = new Map();
    req.nextUrl.searchParams.forEach((value, key) => _search.set(key, value));
    const search = searchParamsCache.parse({
        ...Object.fromEntries(_search),
        // pk: generateRandomString(),
        salesType: "order" as SalesType,
    });

    // search.pk = generateRandomString();
    // const where = whereSales(search);
    // const data = await prisma.salesOrders.findMany({
    //     where,
    //     include: SalesListInclude,
    //     ...pageQueryFilter(search),
    // });
    // const pageInfo = await getPageInfo(search, where, prisma.salesOrders);
    // const d1 = {
    //     // pageCount: pageInfo.pageCount,
    //     // pageInfo,
    //     data: data.map(salesOrderDto),
    //     meta: {
    //         totalFilters: {},
    //         totalRowCount: pageInfo.pageCount,
    //         filterRowCount: data?.length,
    //     },
    // };
    // return Response.json(d1);
    return Response.json(await getSalesOrdersDta(search));
}