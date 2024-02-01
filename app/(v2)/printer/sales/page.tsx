import { getSalesPrintData } from "./get-sales-print-data";
import { OrderBasePrinter } from "./order-base-printer";
import SalesPrintBlock from "./sales-print-block";

export interface SalesPrintProps {
    searchParams: {
        slugs: string;
    };
}
export default async function PrintOrderPage({
    searchParams,
}: SalesPrintProps) {
    const slugs = searchParams.slugs?.split(",");
    const actions = slugs?.map((slug) => getSalesPrintData(slug, searchParams));
    return (
        <OrderBasePrinter>
            {actions?.map((action, index) => (
                <SalesPrintBlock key={index} action={action} />
            ))}
        </OrderBasePrinter>
    );
}
