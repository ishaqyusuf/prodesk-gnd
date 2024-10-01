import { TCell } from "@/app/(clean-code)/_common/components/data-table/table-cells";
import { GetSalesOrdersDta } from "../data-access/sales-list-dta";
import { cn } from "@/lib/utils";
import { useTRContext } from "@/app/(clean-code)/_common/components/data-table/use-data-table";
import { Progress } from "@/app/(clean-code)/_common/components/progress";
import { Menu } from "@/app/(clean-code)/_common/components/menu";
import { Button } from "@/components/ui/button";

interface ItemProps {
    item: GetSalesOrdersDta["data"][number];
}
function Order({ item }: ItemProps) {
    return (
        <TCell href={item.links.overview}>
            <TCell.Primary>{item.orderId}</TCell.Primary>
            <TCell.Secondary>{item.salesDate}</TCell.Secondary>
        </TCell>
    );
}
function Customer({ item }: ItemProps) {
    return (
        <TCell href={item.links.customer}>
            <TCell.Primary className={cn(item.isBusiness && "text-blue-700")}>
                {item.displayName}
            </TCell.Primary>
            <TCell.Secondary>{item.customerPhone}</TCell.Secondary>
        </TCell>
    );
}
function Address({ item }: ItemProps) {
    const rowCtx = useTRContext();
    return (
        <TCell>
            <TCell.Secondary>{item.address}</TCell.Secondary>
        </TCell>
    );
}
function SalesRep({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary>{item.salesRep}</TCell.Secondary>
        </TCell>
    );
}
function Status({ item }: ItemProps) {
    return (
        <TCell>
            <Menu
                Trigger={
                    <Button size="sm" variant="secondary">
                        <Progress>
                            <Progress.Status>
                                {item.status.status}
                            </Progress.Status>
                            <TCell.Secondary>
                                {item.status.date}
                            </TCell.Secondary>
                        </Progress>
                    </Button>
                }
            >
                <Menu.Label>Sales Progress</Menu.Label>
                <Menu.Item icon="pickup">Delivery</Menu.Item>
                <Menu.Item icon="delivery">Pickup</Menu.Item>
            </Menu>
        </TCell>
    );
}
function Dispatch({ item }: ItemProps) {
    //  const []
    return (
        <TCell>
            <Menu
                Trigger={
                    <Button size="sm" variant="secondary">
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

    return (
        <TCell>
            <Button
                variant="secondary"
                className="flex flex-col items-end"
                size="sm"
            >
                <TCell.Primary>
                    <TCell.Money
                        value={invoice.total}
                        className={cn(
                            "font-semibold",
                            !invoice.pending && "text-green-700/70 ",
                            invoice.pending == invoice.total &&
                                "  text-red-700/70 "
                        )}
                    />
                </TCell.Primary>
                <TCell.Primary>
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
                </TCell.Primary>
            </Button>
        </TCell>
    );
}
export let Cells = {
    Order,
    Customer,
    Address,
    SalesRep,
    Invoice,
    Status,
    Dispatch,
};
