import { SalesStat } from "@prisma/client";
import { SalesStatType } from "../../../types";
import { GetFullSalesDataDta } from "../sales-dta";
import { salesItemGroupOverviewDto } from "./sales-item-dto";
import { statStatus } from "../../utils/sales-utils";

type ItemGroup = ReturnType<typeof salesItemGroupOverviewDto>;
export function salesItemsStatsDto(
    data: GetFullSalesDataDta,
    itemGroup: ItemGroup
) {
    const dataStats = statToKeyValueDto(data.stat);
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
    const cs = statToKeyValueDto(data.stat);
    function populate(type: SalesStatType, pending, success) {
        if (!cs[type])
            cs[type] = {
                score: 0,
                total: 0,
                salesId: data.id,
                type,
            } as any;
        const totalPending = pending?.total || 0;
        const totalSuccess = success?.total || 0;
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
    return cs;
}
export function statToKeyValueDto(dataStats: SalesStat[]) {
    // const dataStats = data.stat;
    const k: { [k in SalesStatType]: SalesStat } = {} as any;
    dataStats?.map((d) => {
        k[d.type] = d;
    });
    return k;
}
export function overallStatus(dataStats: SalesStat[]) {
    const sk = statToKeyValueDto(dataStats);
    const overallPercentage =
        sk.prodAssignment?.percentage +
        sk.prod?.percentage +
        sk.dispatch?.percentage;
    let percentage = overallPercentage > 0 ? overallPercentage / 3 : 0;
    return {
        percentage,
        status: statStatus(percentage),
    };
}
