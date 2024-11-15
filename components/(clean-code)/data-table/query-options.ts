// import { ColumnSchema } from "./schema";
import { SearchParamsType, searchParamsSerializer } from "./search-params";
import { infiniteQueryOptions, keepPreviousData } from "@tanstack/react-query";
import { Percentile } from "@/lib/request/percentile";

export type InfiniteQueryMeta = {
    totalRowCount: number;
    filterRowCount: number;
    totalFilters; //: MakeArray<ColumnSchema>;
    currentPercentiles: Record<Percentile, number>;
};

export const dataOptions = (
    search: SearchParamsType,
    serverAction,
    queryKey
) => {
    return infiniteQueryOptions({
        queryKey: [queryKey, searchParamsSerializer({ ...search, uuid: null })], // remove uuid as it would otherwise retrigger a fetch
        queryFn: async ({ pageParam = 0 }) => {
            console.log("QUERYING>>>>>>>>>");
            const start = (pageParam as number) * search.size;
            return await serverAction({ ...search, start });
        },
        initialPageParam: 0,
        getNextPageParam: (_lastGroup, groups) => groups.length,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
};
