import { IGetFullSale } from "@/data-acces/sales.get-overview";
import { dateData, infoData } from "./data-util";
import { capitalize } from "lodash";
import { SalesStat } from "@prisma/client";
import {
    SalesStatType,
    TypedSalesStat,
} from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { sum } from "@/lib/utils";
import { SalesItem } from "@/data-acces/sales";

export function composeSalesCostBreakdown(data: IGetFullSale) {
    if (data.type != "order") return null;
    return {};
}

export function composeSalesInformation(data: IGetFullSale) {
    return {
        list: [
            infoData(capitalize(`${data.type} #`), data.orderId),
            dateData(capitalize(`${data.type} Date`), data.createdAt),
            infoData("Sales Rep", data.salesRep?.name),
            infoData("P.O No", data.meta?.po),
        ],
        stats: composeSalesStatKeyValue(data.stat),
        address: composeSalesAddress(data),
    };
}
export function composeSalesAddress(data: IGetFullSale) {
    return {
        businessName: data.customer?.businessName,
        customerName: data.customer?.name,
        customerId: data.customerId,
        shipTo: {
            id: data.shippingAddressId,
            name: data.shippingAddress?.name,
            phone: data.shippingAddress?.phoneNo,
            address: [
                data.shippingAddress.address1,
                data.shippingAddress.state,
                data.shippingAddress.city,
                data.shippingAddress.meta.zip_code,
            ],
        },
    };
}
export function composeSalesStatus(data: IGetFullSale) {
    const statsKv = composeSalesStatKeyValue(data.stat);
    return statsKv;
}
export function composeTotalDeliverables(item: SalesItem) {
    if (item.isDyke)
        return sum([
            ...item.doors?.map((d) => sum([d.lhQty, d.rhQty])),
            ...item.items.filter((i) => i.dykeProduction).map((i) => i.qty),
        ]);
    return sum(item.items.filter((i) => i.swing).map((i) => i.qty));
}
export function composeSalesStatKeyValue(stats: SalesStat[]) {
    const resp: { [id in SalesStatType]: TypedSalesStat } = {} as any;

    stats.map((stat) => (resp[stat.type] = stat));

    return resp;
}
