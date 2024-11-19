import { TCell } from "@/components/(clean-code)/data-table/table-cells";
import { GetSalesQuotesDta } from "../data-access/sales-dta";
import { cn } from "@/lib/utils";
import { useTRContext } from "@/components/(clean-code)/data-table/use-data-table";
import { useTheme } from "next-themes";
import TextWithTooltip from "@/components/(clean-code)/custom/text-with-tooltip";

export interface ItemProps {
    item: GetSalesQuotesDta["data"][number];
}
export type SalesItemProp = ItemProps["item"];
function Date({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary className="font-mono">
                {item.salesDate}
            </TCell.Secondary>
        </TCell>
    );
}
function Order({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary className="whitespace-nowrap  ">
                {item.orderId}
            </TCell.Secondary>
            {/* <TCell.Secondary>{item.salesDate}</TCell.Secondary> */}
        </TCell>
    );
}
function Customer({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Primary
                className={cn(
                    item.isBusiness && "text-blue-700",
                    "whitespace-nowrap"
                )}
            >
                <TextWithTooltip
                    className="max-w-[100px]"
                    text={item.displayName || "-"}
                />
            </TCell.Primary>
            {/* <TCell.Secondary>{item.customerPhone}</TCell.Secondary> */}
        </TCell>
    );
}
function CustomerPhone({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary className="whitespace-nowrap">
                <TextWithTooltip
                    className="max-w-[85px]"
                    text={item.customerPhone || "-"}
                />
            </TCell.Secondary>
        </TCell>
    );
}
function Address({ item }: ItemProps) {
    const rowCtx = useTRContext();
    return (
        <TCell>
            <TCell.Secondary>
                <TextWithTooltip
                    className="max-w-[100px]"
                    text={item.address}
                />
            </TCell.Secondary>
        </TCell>
    );
}
function SalesRep({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary className="whitespace-nowrap">
                <TextWithTooltip
                    className="max-w-[85px]"
                    text={item.salesRep}
                />
            </TCell.Secondary>
        </TCell>
    );
}

function Invoice({ item }: ItemProps) {
    const invoice = item.invoice;
    const { theme } = useTheme();
    return (
        <TCell>
            <TCell.Money value={invoice.total} className={cn("font-mono")} />
        </TCell>
    );
}
function Po({ item }: ItemProps) {
    // if (!item.poNo) return null;
    return (
        <TCell>
            <div>{item.poNo}</div>
        </TCell>
    );
}
function InvoicePending({ item }: ItemProps) {
    const invoice = item.invoice;
    const { theme } = useTheme();
    return (
        <TCell>
            <TCell.Money
                value={invoice.pending || 0}
                className={cn(
                    "text-muted-foreground font-mono font-medium",

                    invoice.pending && "  text-red-700/70"
                )}
            />
        </TCell>
    );
}
export let QuotesCell = {
    Order,
    Po,
    Customer,
    Address,
    SalesRep,
    Invoice,
    Date,
    CustomerPhone,
    InvoicePending,
};
