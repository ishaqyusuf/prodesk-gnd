import { SalesItem } from "@/data-acces/sales";
import { sum } from "@/lib/utils";
import {
    SalesStatStatus,
    SalesStatType,
    TypedSalesStat,
} from "../../sales-v2/type";
import { SalesStat } from "@prisma/client";

export function sales_TotalDeliverables(item: SalesItem) {
    if (item.isDyke)
        return sum([
            ...item.doors?.map((d) => sum([d.lhQty, d.rhQty])),
            ...item.items.filter((i) => i.dykeProduction).map((i) => i.qty),
        ]);
    return sum(item.items.filter((i) => i.swing).map((i) => i.qty));
}
export function sales_StattoKeyValue(stats: SalesStat[]) {
    const resp: { [id in SalesStatType]: TypedSalesStat } = {} as any;

    stats.map((stat) => (resp[stat.type] = stat));

    return resp;
}
