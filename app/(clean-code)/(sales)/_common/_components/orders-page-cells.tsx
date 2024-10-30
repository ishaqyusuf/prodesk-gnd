import { TCell } from "@/components/(clean-code)/data-table/table-cells";
import { GetSalesOrdersDta } from "../data-access/sales-dta";
import { cn } from "@/lib/utils";
import { useTRContext } from "@/components/(clean-code)/data-table/use-data-table";
import { Progress } from "@/components/(clean-code)/progress";
import { Menu } from "@/components/(clean-code)/menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import TextWithTooltip from "@/components/(clean-code)/custom/text-with-tooltip";

export interface ItemProps {
    item: GetSalesOrdersDta["data"][number];
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
function Status({ item }: ItemProps) {
    return (
        <TCell>
            <Progress>
                <Progress.Status>{item.status.status}</Progress.Status>
                <TCell.Secondary>{/* {item.status.date} */}</TCell.Secondary>
            </Progress>
        </TCell>
    );
}
function Dispatch({ item }: ItemProps) {
    //  const []
    const { theme } = useTheme();
    return (
        <TCell>
            <Progress.Status>pickup</Progress.Status>
        </TCell>
    );
    return (
        <TCell>
            <Menu
                Trigger={
                    <Button
                        size="sm"
                        className="h-auto py-1"
                        variant={theme == "dark" ? "outline" : "secondary"}
                    >
                        <Progress>
                            <Progress.Status>pickup</Progress.Status>
                            <TCell.Secondary>{item.salesDate}</TCell.Secondary>
                        </Progress>
                    </Button>
                }
            >
                <Menu.Item
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                >
                    About Delivery
                </Menu.Item>
                <Menu.Separator />
                <Menu.Label>Change Delivery</Menu.Label>
                <Menu.Item icon="pickup">Delivery</Menu.Item>
                <Menu.Item icon="delivery">Pickup</Menu.Item>
            </Menu>
        </TCell>
    );
}
function Invoice({ item }: ItemProps) {
    const invoice = item.invoice;
    const { theme } = useTheme();
    return (
        <TCell align="right">
            <TCell.Money value={invoice.total} className={cn("font-mono")} />

            {/* <TCell.Primary>
                    <TCell.Money
                        value={invoice.pending}
                        className={cn(
                            "hidden",
                            invoice.pending &&
                                invoice.pending != invoice.total &&
                                "  text-green-700/70 ",
                            invoice.pending &&
                                invoice.pending != invoice.total &&
                                "  text-red-700/70 block"
                        )}
                    />
                </TCell.Primary> */}
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
export let Cells = {
    Order,
    Customer,
    Address,
    SalesRep,
    Invoice,
    Date,
    Status,
    Dispatch,
    CustomerPhone,
    InvoicePending,
};
