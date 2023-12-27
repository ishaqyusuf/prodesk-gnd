"use client";

import { getStaticCustomers } from "@/app/_actions/sales/sales-customers";
import { DynamicFilter } from "@/components/data-table/data-table-dynamic-filter";

export function SalesCustomerFilter({ table }) {
    return (
        <DynamicFilter
            table={table}
            single
            listKey="staticSalesCustomers"
            labelKey="name"
            valueKey="id"
            title="Customer"
            columnId="_customerId"
            loader={getStaticCustomers}
        />
    );
}
