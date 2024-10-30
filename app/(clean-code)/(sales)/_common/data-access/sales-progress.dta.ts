import { prisma } from "@/db";
import { SalesStatType } from "../../types";
import { percent } from "@/lib/utils";
import { statStatus } from "../utils/sales-utils";
import {
    getFullSaleById,
    getSalesItemOverviewDta,
    typedFullSale,
} from "./sales-dta";
import {
    salesItemGroupOverviewDto,
    salesOverviewDto,
} from "./dto/sales-item-dto";

export async function initSalesProgressDta(id) {}
export async function salesAssignmentCreated(orderId, qty) {
    await updateSalesProgressDta(orderId, "prodAssignment", qty);
}
async function createSalesProgressDta(
    salesId,
    type: SalesStatType,
    total,
    score
) {
    await prisma.salesStat.create({
        data: {
            score,
            total,
            ...statMeta(total, score),
            salesId,
            type,
        },
    });
}
async function generateMissingStatsDta(salesId) {
    const data = typedFullSale(await getFullSaleById(salesId));
    const overview = salesOverviewDto(data);

    // overview.
}
async function updateSalesProgressDta(
    salesId,
    type: SalesStatType,
    { total = null, score = null, plusScore = 0, minusScore = 0 }
) {
    const stat = await prisma.salesStat.findFirst({
        where: {
            type,
            salesId,
        },
    });
    if (!stat?.id) {
        await generateMissingStatsDta(salesId);
        return;
    }
    if (!total) total = stat.total;
    if (!score) score = stat.score;
    score = score + plusScore - minusScore;
    await prisma.salesStat.update({
        where: {
            id: stat.id,
        },
        data: {
            score,
            total,
            ...statMeta(total, score),
        },
    });
}
function statMeta(total, score) {
    const percentage = percent(score, total);
    const status = statStatus(percentage);
    return {
        percentage,
        status,
    };
}
