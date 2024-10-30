import { SalesStat } from "@prisma/client";
import { SalesStatType } from "../../../types";
import { GetFullSalesDataDta } from "../sales-dta";
import { salesItemGroupOverviewDto } from "./sales-item-dto";

type ItemGroup = ReturnType<typeof salesItemGroupOverviewDto>;
export function salesItemsStatsDto(
    data: GetFullSalesDataDta,
    itemGroup: ItemGroup
) {
    const dataStats = statToKeyValueDto(data);
    const calculatedStats = calculatedStatsDto(itemGroup, data);
    return {
        salesStatByKey: dataStats,
        calculatedStats,
    };
}
export function calculatedStatsDto(
    itemGroup: ItemGroup,
    data: GetFullSalesDataDta
) {
    const cs = statToKeyValueDto(data);
    function populate(type: SalesStatType, pending, success) {
        if (!cs[type])
            cs[type] = {
                score: 0,
                total: 0,
                salesId: data.id,
                type,
            } as any;
        const totalPending = pending.total;
        const totalSuccess = success.total;
        cs[type].score += totalSuccess;
        cs[type].total += totalPending + totalSuccess;
    }
    itemGroup.map((grp) => {
        grp.items?.map((item) => {
            const { pending, success } = item.analytics;
            populate("prodAssignment", pending.assignment, success.assignment);
            populate("prod", pending.production, success.production);
            populate("dispatch", pending.delivery, success.delivery);
        });
    });
}
export function statToKeyValueDto(data: GetFullSalesDataDta) {
    const dataStats = data.stat;
    const k: { [k in SalesStatType]: SalesStat } = {} as any;
    const calculatedStats: { [k in SalesStatType]: SalesStat } = {} as any;
    dataStats?.map((d) => {
        k[d.type] = d;
    });
    return k;
}
