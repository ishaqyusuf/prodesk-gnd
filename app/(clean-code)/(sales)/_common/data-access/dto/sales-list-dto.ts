import { formatDate, timeAgo } from "@/lib/use-day";
import { GetSalesListDta } from "../sales-dta";
import { salesLinks } from "./links-dto";
import { SalesStat } from "@prisma/client";
import { SalesStatType, SalesType } from "../../../types";

export type Item = GetSalesListDta["data"][number];
export function salesOrderDto(data: Item) {
    return {
        ...commonListData(data),
        status: getSalesOrderStatus(data.stat),
    };
}
function getSalesOrderStatus(stats: SalesStat[]) {
    const _stat: { [id in SalesStatType]: SalesStat } = {} as any;
    stats.map((s) => (_stat[s.type] = s));

    return {
        status: "-",
        date: undefined,
    };
}
function commonListData(data: Item) {
    return {
        orderId: data.orderId,
        isDyke: data.isDyke,
        slug: data.slug,
        address:
            data.shippingAddress?.address1 || data.billingAddress?.address1,
        displayName: data.customer?.businessName || data?.shippingAddress?.name,
        isBusiness: data.customer?.businessName,
        salesRep: data.salesRep?.name,
        customerPhone:
            data.shippingAddress?.phoneNo ||
            data.billingAddress?.phoneNo ||
            data.customer?.phoneNo,
        salesDate: timeAgo(data.createdAt),
        links: salesLinks(data),
        shippingId: data.shippingAddressId,
        type: data.type as SalesType,
        invoice: {
            total: data.grandTotal,
            paid: data.grandTotal - data.amountDue,
            pending: data.amountDue,
        },
    };
}
export function salesQuoteDto(data: Item) {
    return {
        ...commonListData(data),
    };
}
