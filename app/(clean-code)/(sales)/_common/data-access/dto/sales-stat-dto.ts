import { SalesStat } from "@prisma/client";
import { SalesStatType } from "../../../types";
import { GetFullSalesDataDta } from "../sales-dta";
import { salesItemGroupOverviewDto } from "./sales-item-dto";
import { statStatus } from "../../utils/sales-utils";
import { Colors } from "@/lib/status-badge";

type ItemGroup = ReturnType<typeof salesItemGroupOverviewDto>;
export function salesItemsStatsDto(
    data: GetFullSalesDataDta,
    itemGroup: ItemGroup
) {
    const dataStats = statToKeyValueDto(data.stat);
    const calculatedStats = calculatedStatsDto(itemGroup, data);
    console.log(calculatedStats?.dispatch);

    return {
        salesStatByKey: dataStats,
        calculatedStats,
    };
}

export function calculatedStatsDto(
    itemGroup: ItemGroup,
    data: GetFullSalesDataDta
) {
    const cs = statToKeyValueDto(data.stat, true);
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
        cs[type].percentage = (cs[type].score / cs[type].total) * 100 || 0;
    }
    itemGroup.map((grp, grpIndex) => {
        // console.log(grp.items.length, grpIndex);

        grp.items?.map((item) => {
            const { pending, success } = item.analytics;

            populate("prodAssignment", pending.assignment, success.assignment);
            populate("prod", pending.production, success.production);
            populate("dispatch", pending.delivery, success.delivery);
        });
    });

    return cs;
}
export function statToKeyValueDto(dataStats: SalesStat[], reset = false) {
    // const dataStats = data.stat;
    const k: { [k in SalesStatType]: SalesStat } = {} as any;
    dataStats?.map(({ score, percentage, total, ...rest }) => {
        if (rest) {
            score = percentage = total = 0;
        }
        k[rest.type] = {
            ...rest,
            score,
            percentage,
            total,
        };
    });
    return k;
}
export function overallStatus(dataStats: SalesStat[]) {
    const sk = statToKeyValueDto(dataStats);
    return {
        production: statStatus(sk.prod),
        assignment: statStatus(sk.prodAssignment),
        payment: statStatus(sk.payment),
        delivery: statStatus(sk.dispatch),
    };
}
