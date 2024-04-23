"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
    CheckColumn,
    ColumnHeader,
    Cell,
    PrimaryCellContent,
    SecondaryCellContent,
} from "../columns/base-columns";

import { PrintOrderMenuAction } from "../actions/order-actions";
import { DataTable2 } from "../data-table/data-table-2";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { Printer } from "lucide-react";
import { ICustomer } from "@/types/customers";
import {
    setCustomerProfileAction,
    staticCustomerProfilesAction,
} from "@/app/(v1)/_actions/sales/sales-customer-profiles";
import { loadStaticList } from "@/store/slicers";
import { useAppSelector } from "@/store";
import { CustomerTypes } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    EditRowAction,
    RowActionCell,
} from "../data-table/data-table-row-actions";
import { openModal } from "@/lib/modal";
import AuthGuard from "../auth-guard";
import { SmartTable } from "../data-table/smart-table";
import { Icons } from "../icons";
import CustomersBatchAction from "../sales/customers/customers-selection-action";
import { useCustomerProfiles } from "@/_v2/hooks/use-static-data";

export default function CustomersTableShell<T>({
    data,
    pageInfo,
    searchParams,
}: TableShellProps<ICustomer>) {
    const [isPending, startTransition] = useTransition();
    const profiles = useCustomerProfiles();
    useEffect(() => {
        setDefaultProfile(profiles.data?.find((p) => p.defaultProfile) as any);
    }, [profiles.data]);
    const [defaultProfile, setDefaultProfile] = useState<CustomerTypes>(
        {} as any
    );
    const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
    const route = useRouter();
    async function setCustomerProfile(id, p) {
        await setCustomerProfileAction(id, p.id);
        toast.success("Success!.");
        route.refresh();
    }
    const table = SmartTable<ICustomer>(data);
    const columns = useMemo<ColumnDef<ICustomer, unknown>[]>(
        () => [
            table.checkColumn(),
            table.simpleColumn("#", (data) => ({
                story: [
                    table.primaryText(data.id),
                    table.secondary(data.createdAt),
                ],
            })),
            table.simpleColumn("Customer", (data) => ({
                link: `/sales/customer/${data.id}`,
                story: [
                    table.primaryText(data.businessName || data.name),
                    table.secondary(data.phoneNo),
                ],
            })),
            {
                id: "role",
                header: ColumnHeader("Profile"),
                cell: ({ row }) => (
                    <Cell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    className="flex h-8  data-[state=open]:bg-muted"
                                >
                                    <span className="whitespace-nowrap">
                                        {row.original.profile?.title ||
                                            defaultProfile?.title ||
                                            "Select Profile"}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[185px]"
                            >
                                {profiles?.data?.map((profile) => (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setCustomerProfile(
                                                row.original.id,
                                                profile
                                            )
                                        }
                                        key={profile.id}
                                    >
                                        {profile.title}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Cell>
                ),
            },
            {
                accessorKey: "orders",
                header: ColumnHeader("Orders"),
                cell: ({ row }) => <>{row.original?._count?.salesOrders}</>,
            },

            {
                accessorKey: "_status",
                enableHiding: false,
            },
            {
                accessorKey: "_q",
                enableHiding: false,
            },
            {
                accessorKey: "_payment",
                enableHiding: false,
            },
            {
                accessorKey: "actions",
                header: ColumnHeader(""),
                size: 15,
                maxSize: 15,
                enableSorting: false,
                cell: ({ row }) => (
                    <RowActionCell>
                        <AuthGuard can={["editOrders"]}>
                            <EditRowAction
                                onClick={(e) => {
                                    openModal("customerForm", row.original);
                                }}
                            />
                        </AuthGuard>
                    </RowActionCell>
                ),
            },
        ],
        [data, isPending]
    );
    return (
        <DataTable2
            searchParams={searchParams}
            columns={columns}
            pageInfo={pageInfo}
            data={data}
            BatchAction={({ items }) => <CustomersBatchAction items={items} />}
            filterableColumns={[]}
            searchableColumns={[
                {
                    id: "_q" as any,
                    title: "customer, phone, address",
                },
            ]}
        />
    );
}
