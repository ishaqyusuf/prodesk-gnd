import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { customerStore } from "./store";
import { TCell } from "@/components/(clean-code)/data-table/table-cells";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { CircleArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/use-number";
import Money from "@/components/_v1/money";
import { openTxForm } from "../tx-form";

export default function SalesTab() {
    const ctx = customerStore();
    return (
        <div className="">
            <div className="flex">
                <Button
                    onClick={() => {
                        ctx.clear();
                    }}
                    size="xs"
                >
                    <CircleArrowLeft className="size-4" />
                </Button>
                <div className="flex-1"></div>
                <div>
                    <div className="flex gap-2">
                        <Label>Customer Balance:</Label>
                        <Label>
                            <Money
                                value={ctx.salesInfo?.wallet?.customerBalance}
                            />
                        </Label>
                    </div>
                </div>
            </div>
            <ScrollArea className="h-[80vh] pb-16 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableHead>Date</TableHead>
                        <TableHead>Order No</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Pending</TableHead>
                    </TableHeader>
                    <TableBody>
                        {ctx.salesInfo?.orders?.map((order) => (
                            <TableRow
                                className={cn(
                                    "cursor-pointer",
                                    ctx.selections?.[order.orderId]?.checked
                                        ? "bg-muted-foreground/10 hover:bg-muted-foreground/10"
                                        : ""
                                )}
                                onClick={() => {
                                    let c = ctx?.selections?.[order.orderId];
                                    if (!c) {
                                        c = {
                                            id: order.id,
                                            amount: order.amountDue,
                                            checked: true,
                                        };
                                    } else c.checked = !c.checked;
                                    ctx.dotUpdate(
                                        `selections.${order.orderId}`,
                                        c
                                    );
                                    let amount = ctx.total;
                                    amount += c.amount * (c.checked ? 1 : -1);
                                    ctx.dotUpdate("total", formatMoney(amount));
                                }}
                                key={order.orderId}
                            >
                                <TCell>
                                    <TCell.Date>{order.createdAt}</TCell.Date>
                                </TCell>
                                <TCell>
                                    <TCell.Secondary className="uppercase font-mono">
                                        {order.orderId}
                                    </TCell.Secondary>
                                </TCell>
                                <TCell align="right">
                                    <TCell.Money value={order.grandTotal} />
                                </TCell>
                                <TCell align="right">
                                    <TCell.Money value={order.amountDue} />
                                </TCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!ctx.salesInfo?.orders?.length && (
                    <div className="text-sm text-muted-foreground text-center mt-4">
                        <div className="">
                            Customer have no pending payments
                        </div>
                    </div>
                )}
            </ScrollArea>
            <div className="flex sticky bottom-0 p-4 left-0 gap-4 justify-end items-center">
                <Label>
                    <Money value={ctx.total} />
                </Label>
                <Button
                    onClick={() => {
                        openTxForm({
                            paymentMethod: "terminal",
                            phoneNo: ctx.phoneNo,
                            payables: Object.entries(ctx.selections || {})
                                .filter(([k, v]) => v.checked)
                                .map(([k, v]) => ({
                                    id: v.id,
                                    amountDue: v.amount,
                                })),
                        });
                    }}
                >
                    Pay
                </Button>
            </div>
        </div>
    );
}
