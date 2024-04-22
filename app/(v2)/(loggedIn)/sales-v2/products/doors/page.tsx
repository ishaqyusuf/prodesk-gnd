import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import DykeTabLayout from "../_components/dyke-tab-layout";
import { Metadata } from "next";
import { Shell } from "@/components/shell";
import ShelfItemsTable from "../_components/shelf-items-table";
import { SearchParams } from "@/types";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { getShelfItems } from "../_actions/get-shelf-items";
import DykeDoorsTable from "./_components/dyke-doors-table";
import { _getDykeDoors } from "../_actions/dyke-doors";
export const metadata: Metadata = {
    title: "Shelf Items | GND",
};
interface Props {
    searchParams: SearchParams;
}
export default function DykeDoorsPage({ searchParams }: Props) {
    const query = queryParams(searchParams);
    const promise = _getDykeDoors(query);
    return (
        <DykeTabLayout>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Dyke Doors" />
            </Breadcrumbs>
            <Shell className="">
                <DykeDoorsTable promise={promise} />
            </Shell>
        </DykeTabLayout>
    );
}