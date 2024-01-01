import {
    getSalesEstimates,
    getSalesOrder,
} from "@/app/(v1)/_actions/sales/sales";
import OrdersTableShell from "@/app/(v1)/(auth)/sales/orders/components/orders-table-shell";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { ISalesOrder, ISalesPayment } from "@/types/sales";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import EstimatesTableShell from "@/components/_v1/shells/estimates-table-shell";
import PageHeader from "@/components/_v1/page-header";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import { getsalesPayments } from "@/app/(v1)/_actions/sales-payment/crud";
import SalesPaymentTableShell from "@/components/_v1/shells/sales-payment-table-shell";
import { getLegacyProducts } from "@/app/(v1)/_actions/sales-products/crud";
import ProductsTableShell from "@/components/_v1/shells/products-table-shell";
import ProductCatalogModal from "@/components/_v1/modals/product-catalog-modal";

interface Props {}
export default async function SalesProducts({ searchParams }) {
    const response = await getLegacyProducts(queryParams(searchParams));
    return (
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
    );
}
