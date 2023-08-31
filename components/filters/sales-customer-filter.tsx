"use client";

import { DynamicFilter } from "../data-table/data-table-dynamic-filter";
import { getStaticCustomers } from "@/app/_actions/sales/sales-customers";

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
