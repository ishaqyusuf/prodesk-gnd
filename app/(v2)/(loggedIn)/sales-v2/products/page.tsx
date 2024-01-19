import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import DykeTabLayout from "./components/dyke-tab-layout";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import { getDykeProducts } from "./_actions/get-dyke-products";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import ProductsTable from "./components/products-table";

export default async function ProductsPage({ searchParams }) {
    const response = await getDykeProducts(queryParams(searchParams));

    return (
        <DykeTabLayout>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Products" />
            </Breadcrumbs>
            <div className="">
                <ProductsTable {...response} />
            </div>
        </DykeTabLayout>
    );
}
