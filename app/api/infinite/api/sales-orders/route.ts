import { getSalesOrderInfinityListUseCase } from "@/app/(clean-code)/(sales)/_common/use-case/sales-list-use-case";
import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const _search: Map<string, string> = new Map();

    // TODO: we could use a POST request to avoid this
    req.nextUrl.searchParams.forEach((value, key) => _search.set(key, value));
    const search = searchParamsCache.parse(Object.fromEntries(_search));
    return Response.json(await getSalesOrderInfinityListUseCase(search));
}
