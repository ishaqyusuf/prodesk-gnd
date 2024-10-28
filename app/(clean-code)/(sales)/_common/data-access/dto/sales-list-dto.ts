import { formatDate, timeAgo } from "@/lib/use-day";
import { GetSalesListDta } from "../sales-dta";
import { salesLinks } from "./links-dto";
import { SalesStat } from "@prisma/client";
import {
    AddressBookMeta,
    SalesMeta,
    SalesStatType,
    SalesType,
} from "../../../types";

export type Item = GetSalesListDta["data"][number];
export function salesOrderDto(data: Item) {
    return {
        ...commonListData(data),
        status: getSalesOrderStatus(data.stat),
        addressData: {
            shipping: getAddressDto(
                data.shippingAddress || data.billingAddress,
                "Shipping Address"
            ),
            billing: getAddressDto(data.billingAddress, "Billing Address"),
        },
    };
}
function getAddressDto(data: Item["shippingAddress"], title) {
    // console.log(data);
    if (!data) return {};
    const meta: AddressBookMeta = data?.meta as any;
    return {
        id: data.id,
        title,
        name: data.name,
        phone: data.phoneNo,
        email: data.email,
        address: [data.address1, meta?.zip_code]?.filter(Boolean).join(" "),
    };
}
function getSalesOrderStatus(stats: SalesStat[]) {
    const _stat: { [id in SalesStatType]: SalesStat } = {} as any;
    stats.map((s) => (_stat[s.type] = s));
    return _stat;
    // return {
    //     status: "-",
    //     date: undefined,
    // };
}
function commonListData(data: Item) {
    const meta = (data.meta || {}) as any as SalesMeta;
    return {
        orderId: data.orderId,
        uuid: data.orderId,
        isDyke: data.isDyke,
        slug: data.slug,
        address:
            data.shippingAddress?.address1 || data.billingAddress?.address1,
        displayName: data.customer?.businessName || data?.shippingAddress?.name,
        isBusiness: data.customer?.businessName,
        salesRep: data.salesRep?.name,
        poNo: meta?.po,
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
export function salesStatisticDto(data: Item) {}
export function salesQuoteDto(data: Item) {
    return {
        ...commonListData(data),
    };
}
