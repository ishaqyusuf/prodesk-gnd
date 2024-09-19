import { SalesItem } from "@/data-acces/sales";
import { sum } from "@/lib/utils";

export function sales_TotalDeliverables(item: SalesItem) {
    if (item.isDyke)
        return sum([
            ...item.doors?.map((d) => sum([d.lhQty, d.rhQty])),
            ...item.items.filter((i) => i.dykeProduction).map((i) => i.qty),
        ]);
    return sum(item.items.filter((i) => i.swing).map((i) => i.qty));
}
