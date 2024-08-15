"use client";

import FPageNav from "@/app/_components/fikr-ui/f-page-nav";
import PageHeader from "@/components/_v1/page-header";
import { useDataTableColumn2 } from "@/components/common/data-table/columns/use-data-table-columns";

import { GetSales } from "@/data-acces/sales";
import { use } from "react";
import { Cells } from "./cells";
import { DataTable } from "@/app/_components/data-table";
import { TableToolbar } from "@/app/_components/data-table/toolbar";

interface Props {
    promise;
    quote?: Boolean;
}

export default function ClientPage({ promise, quote }: Props) {
    const { data, pageCount }: GetSales = use(promise);
    const table = useDataTableColumn2(
        data,
        {
            pageCount,
            checkable: false,
            cellVariants: {
                // size: "sm",
            },
        },
        (ctx) => [ctx.Column("Order", Cells.Order)]
    );
    return (
        <>
            <FPageNav>
                <span></span>
            </FPageNav>
            <section className="content space-y-4">
                <div className="">
                    <PageHeader
                        newLink={quote ? "/create-quote" : undefined}
                        title={quote ? "My Quotes" : "My Orders"}
                    />
                </div>
                <DataTable {...table.props}>
                    <TableToolbar>
                        <TableToolbar.Search />
                    </TableToolbar>
                    <DataTable.Table />
                    <DataTable.Footer />
                </DataTable>
            </section>
        </>
    );
}
