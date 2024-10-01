import {
    GetSalesListQuery,
    getSalesOrdersDta,
} from "../data-access/sales-list-dta";

export async function getSalesOrderListUseCase(query: GetSalesListQuery) {
    const list = await getSalesOrdersDta(query);
    return list;
}
