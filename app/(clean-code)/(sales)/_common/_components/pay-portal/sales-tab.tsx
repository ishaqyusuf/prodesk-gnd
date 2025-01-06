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
import { CircleArrowLeft, RefreshCcw } from "lucide-react";

export default function SalesTab() {
    const ctx = customerStore();
    return (
        <div className="">
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        ctx.clear();
                    }}
                    size="xs"
                >
                    <CircleArrowLeft className="mr-2 size-4" />
                    Select Customer
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableHead>Date</TableHead>
                    <TableHead>Order No</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Pending</TableHead>
                </TableHeader>
                <TableBody>
                    {ctx.salesInfo?.orders?.map((order) => (
                        <TableRow key={order.orderId}>
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
                    <div className="">Customer have no pending payments</div>
                </div>
            )}
        </div>
    );
}
