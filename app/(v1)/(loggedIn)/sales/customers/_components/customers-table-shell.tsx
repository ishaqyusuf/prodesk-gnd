"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { ColumnHeader } from "../../../../../../components/_v1/columns/base-columns";

import { DataTable2 } from "@/components/_v1/data-table/data-table-2";
import { Printer } from "lucide-react";
import { ICustomer } from "@/types/customers";
import { setCustomerProfileAction } from "@/app/(v1)/(loggedIn)/sales/_actions/sales-customer-profiles";
import { CustomerTypes } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import CustomersBatchAction from "./customers-selection-action";
import { useCustomerProfiles } from "@/_v2/hooks/use-static-data";
import { GetCustomers, ShowCustomerHaving } from "../../type";
import useDataTableColumn from "@/components/common/data-table/columns/use-data-table-columns";
import { Cells } from "./customer-cells";

export default function CustomersTableShell({ promise, searchParams }) {
    const { data, pageCount }: GetCustomers = React.use(promise);

    const profiles = useCustomerProfiles();
    useEffect(() => {
        setDefaultProfile(profiles.data?.find((p) => p.defaultProfile) as any);
    }, [profiles.data]);
    const [defaultProfile, setDefaultProfile] = useState<CustomerTypes>(
        {} as any
    );

    const route = useRouter();
    async function setCustomerProfile(id, p) {
        await setCustomerProfileAction(id, p.id);
        toast.success("Success!.");
        route.refresh();
    }
    const table = useDataTableColumn(
        data,
        (ctx) => [
            ctx.Column("Profile Name", Cells.Customer),
            ctx.Column("Profile Name", ({ item }) => (
                <Cells.Profile
                    item={item}
                    profiles={profiles}
                    defaultProfile={defaultProfile}
                    setCustomerProfile={setCustomerProfile}
                />
            )),
            ctx.Column("Orders", Cells.Orders),
            ctx.Column("Due", Cells.PendingInvoice),
            ctx.ActionColumn(Cells.Action),
        ],
        true,
        { sn: false, filterCells: ["_q", "_having"] }
    );

    return (
        <DataTable2
            searchParams={searchParams}
            columns={table.columns}
            pageCount={pageCount}
            data={data}
            BatchAction={({ items }) => <CustomersBatchAction items={items} />}
            filterableColumns={[
                {
                    id: "_having",
                    title: "Having",
                    single: true,
                    options: [
                        {
                            label: "Pending Invoice",
                            value: "Pending Invoice" as ShowCustomerHaving,
                        },
                        {
                            label: "No Pending Invoice",
                            value: "No Pending Invoice" as ShowCustomerHaving,
                        },
                    ],
                },
            ]}
            searchableColumns={[
                {
                    id: "_q" as any,
                    title: "customer, phone, address",
                },
            ]}
        />
    );
}
