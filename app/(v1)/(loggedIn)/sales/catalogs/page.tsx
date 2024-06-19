import { queryParams } from "@/app/(v1)/_actions/action-utils";

import PageHeader from "@/components/_v1/page-header";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";

import { getLegacyProducts } from "@/app/(v1)/_actions/sales-products/crud";
import ProductsTableShell from "@/components/_v1/shells/products-table-shell";
import ProductCatalogModal from "@/components/_v1/modals/product-catalog-modal";
import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";

interface Props {}
export default async function SalesCatalogsPage({ searchParams }) {
    const response = await getLegacyProducts(queryParams(searchParams));
    return (
        <AuthGuard can={["editOrders"]}>
            <div className="space-y-4 px-8">
                <Breadcrumbs>
                    <BreadLink isFirst title="Sales" />
                    <BreadLink isLast title="Payments" />
                </Breadcrumbs>
                <PageHeader
                    title="Product Catalog"
                    permissions={["editOrders"]}
                    newDialog="product"
                />
                <ProductsTableShell searchParams={searchParams} {...response} />
                <ProductCatalogModal />
            </div>
        </AuthGuard>
    );
}
