// import { ColumnSchema } from "./schema";
import { SearchParamsType, searchParamsSerializer } from "./search-params";
import { infiniteQueryOptions, keepPreviousData } from "@tanstack/react-query";
import { Percentile } from "@/lib/request/percentile";
import { MakeArray } from "@/types/type";

export type InfiniteQueryMeta = {
    totalRowCount: number;
    filterRowCount: number;
    totalFilters; //: MakeArray<ColumnSchema>;
    currentPercentiles: Record<Percentile, number>;
};

export const dataOptions = (search: SearchParamsType, serverAction) => {
    return infiniteQueryOptions({
        queryKey: [
            "data-table",
            searchParamsSerializer({ ...search, uuid: null }),
        ], // remove uuid as it would otherwise retrigger a fetch
        queryFn: async ({ pageParam = 0 }) => {
            const start = (pageParam as number) * search.size;
            // console.log({ start });
            // const serialize = searchParamsSerializer({ ...search, start });
            const q = await serverAction({ ...search, start });
            console.log("QUERY FN>>>");
            console.log(q);
            return q;
            // const response = await fetch(`/infinite/api${serialize}`);
            // return response.json() as Promise<{
            //     // data: ColumnSchema[];
            //     // meta: InfiniteQueryMeta;
            //     data: any[];
            //     meta: any;
            // }>;
        },
        initialPageParam: 0,
        getNextPageParam: (_lastGroup, groups) => groups.length,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
};
