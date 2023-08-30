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
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { ICustomer } from "@/types/customers";
import {
  setCustomerProfileAction,
  staticCustomerProfiles,
} from "@/app/_actions/sales/sales-customer-profiles";
import { loadStaticList } from "@/store/slicers";
import { useAppSelector } from "@/store";
import { CustomerTypes } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CustomersTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<ICustomer>) {
  const [isPending, startTransition] = useTransition();
  const profiles = useAppSelector(
    (state) => state?.slicers?.staticCustomerProfiles
  );
  useEffect(() => {
    loadStaticList("staticCustomerProfiles", profiles, staticCustomerProfiles);
  }, []);
  useEffect(() => {
    setDefaultProfile(profiles?.find((p) => p.defaultProfile) as any);
  }, [profiles]);
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
  const columns = useMemo<ColumnDef<ICustomer, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),

      {
        accessorKey: "customer",
        header: ColumnHeader("Customer"),
        cell: ({ row }) => (
          <Cell
            row={row.original}
            slug={row.original.id}
            link="/sales/customer/slug"
          >
            <PrimaryCellContent>{row.original.name}</PrimaryCellContent>
            <SecondaryCellContent>{row.original.phoneNo}</SecondaryCellContent>
          </Cell>
        ),
      },
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
              <DropdownMenuContent align="end" className="w-[185px]">
                {profiles?.map((profile) => (
                  <DropdownMenuItem
                    onClick={() => setCustomerProfile(row.original.id, profile)}
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
        // cell: ({ row }) => <OrderRowAction row={row.original} />,
      },
    ],
    [data, isPending]
  );
  return (
    <DataTable2
      columns={columns}
      pageInfo={pageInfo}
      data={data}
      SelectionAction={({ items }) => {
        console.log(items);
        return (
          <>
            {/* <span>{JSON.stringify(items)}</span> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Toggle columns"
                  variant="outline"
                  size="icon"
                  className="ml-auto hidden h-8 lg:flex"
                >
                  <Printer className=" h-4 w-4" />
                  {/* View */}
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </>
        );
      }}
      filterableColumns={[]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "customer, phone, address",
        },
      ]}
      newRowLink={`/sales/order/new/form`}
      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
