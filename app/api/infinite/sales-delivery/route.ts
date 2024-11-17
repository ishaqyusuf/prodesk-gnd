import { getSalesDispatchDta } from "@/app/(clean-code)/(sales)/_common/data-access/sales-dispatch-dta";
import { getSalesOrdersDta } from "@/app/(clean-code)/(sales)/_common/data-access/sales-dta";
import { DeliveryOption } from "@/app/(clean-code)/(sales)/types";
import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import { generateRandomString } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const _search: Map<string, string> = new Map();
    req.nextUrl.searchParams.forEach((value, key) => _search.set(key, value));
    const search = searchParamsCache.parse({
        ...Object.fromEntries(_search),
        pk: generateRandomString(),
        delivery: "delivery" as DeliveryOption,
    });

    return Response.json(await getSalesDispatchDta(search));
}
