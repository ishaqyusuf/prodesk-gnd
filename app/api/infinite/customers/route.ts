import { getCustomersDta } from "@/app/(clean-code)/(sales)/_common/data-access/customer.dta";
import { getSalesOrdersDta } from "@/app/(clean-code)/(sales)/_common/data-access/sales-dta";
import { SalesType } from "@/app/(clean-code)/(sales)/types";

import {
    FilterParams,
    searchParamsCache,
} from "@/components/(clean-code)/data-table/search-params";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const _search: Map<string, string> = new Map();
    req.nextUrl.searchParams.forEach((value, key) => _search.set(key, value));
    const _ = {
        ...Object.fromEntries(_search),
    } as FilterParams;
    const search = searchParamsCache.parse(_ as any);

    return Response.json(await getCustomersDta(search as any));
}
