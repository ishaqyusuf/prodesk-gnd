import { getSalesEstimates, getSalesOrder } from "@/app/_actions/sales/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder, ISalesPayment } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import EstimatesTableShell from "@/components/shells/estimates-table-shell";
import PageHeader from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { getsalesPayments } from "@/app/_actions/sales-payment/crud";
import SalesPaymentTableShell from "@/components/shells/sales-payment-table-shell";
import { getLegacyProducts } from "@/app/_actions/sales-products/crud";
import ProductsTableShell from "@/components/shells/products-table-shell";
import ProductCatalogModal from "@/components/modals/product-catalog-modal";

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
      <ProductsTableShell {...response} />
      <ProductCatalogModal />
    </div>
  );
}
