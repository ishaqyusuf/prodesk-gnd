"use client";

import { getStaticCustomers } from "@/app/(v1)/(loggedIn)/sales/_actions/sales-customers";
import { DynamicFilter } from "@/components/_v1/data-table/data-table-dynamic-filter";

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
