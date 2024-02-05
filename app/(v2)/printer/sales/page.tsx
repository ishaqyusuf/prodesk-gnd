import { cn } from "@/lib/utils";
import BasePrinter from "../base-printer";
import { getSalesPrintData } from "./get-sales-print-data";
import { OrderBasePrinter } from "./order-base-printer";
import SalesPrintBlock from "./sales-print-block";

export interface SalesPrintProps {
    searchParams: {
        slugs: string;
        mode: "order" | "estimate" | "production" | "packing list";
        mockup: "yes" | "no";
        preview: boolean;
        pdf: boolean;
    };
}
export default async function PrintOrderPage({
    searchParams,
}: SalesPrintProps) {
    const slugs = searchParams.slugs?.split(",");
    const actions = slugs?.map((slug) => ({
        slug,
        action: getSalesPrintData(slug, searchParams),
    }));
    return (
        <OrderBasePrinter {...searchParams}>
            <BasePrinter slugs={slugs}>
                {actions?.map((props, index) => (
                    <SalesPrintBlock
                        className={cn(index > 0 && "break-before-page")}
                        key={index}
                        {...props}
                    />
                ))}
            </BasePrinter>
        </OrderBasePrinter>
    );
}
