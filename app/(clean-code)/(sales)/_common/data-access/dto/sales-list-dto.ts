import { GetSalesListDta } from "../sales-list-dta";

type Item = GetSalesListDta["data"][number];
export function salesOrderDto(data: Item) {
    return {
        ...commonListData(data),
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
    };
}
export function salesQuoteDto(data: Item) {
    return {
        ...commonListData(data),
    };
}
