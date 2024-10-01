"use client";

import { use } from "react";
import { GetSalesListDta } from "../data-access/sales-list-dta";

interface Props {
    promise;
}
export default function OrdersPageClient({ promise }: Props) {
    const resp: GetSalesListDta = use(promise);

    return (
        <div>
            <span>{resp.pageCount}</span>
        </div>
    );
}
