import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import DykeTabLayout from "../components/dyke-tab-layout";
import { Metadata } from "next";
import { Shell } from "@/components/shell";
import ShelfItemsTable from "../components/shelf-items-table";
import { SearchParams } from "@/types";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { getShelfItems } from "../_actions/get-shelf-items";
export const metadata: Metadata = {
    title: "Shelf Items | GND",
};
interface Props {
    searchParams: SearchParams;
}
export default function ShelfItemsPage({ searchParams }: Props) {
    const query = queryParams(searchParams);
    const promise = getShelfItems(query);
    return (
        <DykeTabLayout>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Shelf Products" />
            </Breadcrumbs>
            <Shell className="">
                <ShelfItemsTable promise={promise} />
            </Shell>
        </DykeTabLayout>
    );
}
