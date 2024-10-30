import { SalesStat } from "@prisma/client";
import { SalesStatType } from "../../../types";
import { GetFullSalesDataDta } from "../sales-dta";
import { salesItemGroupOverviewDto } from "./sales-item-dto";

export function salesItemsStatsDto(
    data: GetFullSalesDataDta,
    itemGroup: ReturnType<typeof salesItemGroupOverviewDto>
) {
    const dataStats = statToKeyValue(data);

    return {
        salesStatByKey: dataStats,
    };
}

export function statToKeyValue(data: GetFullSalesDataDta) {
    const dataStats = data.stat;
    const k: { [k in SalesStatType]: SalesStat } = {} as any;
    dataStats?.map((d) => {
        k[d.type] = d;
    });
    return k;
}
