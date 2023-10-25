import { ExtendedHome, ICostChartMeta, IHome } from "@/types/community";
import { getBadgeColor } from "../status-badge";
import { Builders, Homes, Projects } from "@prisma/client";
import { deepCopy } from "../deep-copy";
import { sumKeyValues } from "../utils";
import { convertToNumber } from "../use-number";

export function getHomeProductionStatus(home: ExtendedHome) {
    const prod = home?.tasks?.filter(t => t.produceable);
    const produceables = prod?.length;
    const produced = prod?.filter(p => p.producedAt).length;
    const pending = produceables - produced;
    let productionStatus = "Idle";
    const sent = prod?.filter(p => p.sentToProductionAt)?.length;

    if (sent > 0) productionStatus = "Queued";
    if (produced > 0) {
        productionStatus = "Started";
        if (produced == produceables) productionStatus = "Completed";
    }

    return {
        produceables,
        produced,
        pendingProduction: pending,
        productionStatus,
        badgeColor: getBadgeColor(productionStatus)
    };
}
export function homeSearchMeta(
    home: Homes,
    project: Projects | undefined = undefined,
    builder: Builders | undefined = undefined
) {
    const search: any[] = [];
    const { modelName, lot, block } = home;
    if (lot) search.push(`lot${lot} l${lot}`);
    if (block) search.push(`blk${block} b${block}`);
    if (lot && block) search.push(`${lot}/${block}`);
    return search.join(" ");
}
export function hasConflictingDateRanges(dateRanges) {
    dateRanges.sort((a, b) => a.startDate - b.startDate); // Sort date ranges by start date

    for (let i = 0; i < dateRanges.length - 1; i++) {
        const currentRange = dateRanges[i];
        const nextRange = dateRanges[i + 1];

        if (currentRange.endDate >= nextRange.startDate) {
            // Conflicting date ranges found
            return true;
        }
    }
    // No conflicting date ranges found
    return false;
}
export function calculateHomeInvoice(home: ExtendedHome) {
    const data = {
        paid: 0,
        due: 0,
        chargeBack: 0
    };
    home.tasks?.map(task => {
        const due = task.amountDue || 0;
        const paid = task.amountPaid || 0;
        data.due += due;
        if (paid => 0) {
            data.paid += paid;
        } else data.chargeBack += paid;
    });
    return data;
}
export function calculateCommunitModelCost(_cost, builderTasks) {
    // console.log(_cost);
    if (!_cost) return;
    let cost = deepCopy<ICostChartMeta>(_cost);
    if (!cost.tax) cost.tax = {};
    if (!cost.costs) cost.costs = {};
    cost.totalCost = sumKeyValues(cost.costs);
    cost.totalTax = sumKeyValues(cost.tax);

    cost.sumCosts = {};
    builderTasks?.map(task => {
        const k = task.uid;
        const tv = cost.tax?.[k] || 0;
        const cv = cost.costs?.[k] || 0;
        cost.sumCosts[k] = convertToNumber(cv, 0) + convertToNumber(tv, 0);
    });
    cost.grandTotal = sumKeyValues(cost.sumCosts);

    return cost;
}
export function getPivotModel(model) {
    if (!model) return "";
    const pivotM = model
        .toLowerCase()
        .split(" ")
        .flatMap(part => part.split("/"))
        .filter(Boolean)
        .filter(v => !["lh", "rh", "l", "r"].includes(v))
        .join(" ");
    return pivotM;
}
