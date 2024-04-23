import { cn } from "@/lib/utils";
import BasePrinter from "../base-printer";
import { getSalesPrintData } from "./get-sales-print-data";
import { BasePrintProps, OrderBasePrinter } from "./order-base-printer";
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
    const value: BasePrintProps = {
        ...searchParams,
        preview: (searchParams.preview as any) == "true",
        pdf: (searchParams.pdf as any) == "true",
    };
    // console.log({ value, searchParams });

    return (
        <BasePrinter {...value} slugs={slugs}>
            <OrderBasePrinter {...searchParams}>
                {actions?.map((props, index) => (
                    <SalesPrintBlock
                        className={cn(index > 0 && "break-before-page")}
                        key={index}
                        {...props}
                    />
                ))}
            </OrderBasePrinter>
        </BasePrinter>
    );
}
