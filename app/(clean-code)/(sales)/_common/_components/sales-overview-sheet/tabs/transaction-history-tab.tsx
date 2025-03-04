"use client";

import useEffectLoader from "@/lib/use-effect-loader";
import { salesOverviewStore } from "../store";
import Money from "@/components/_v1/money";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TCell } from "@/components/(clean-code)/data-table/table-cells";
import { getSalesPaymentsAction } from "@/actions/get-sales-payment";
import NoResults from "./empty-tx-history";
import ConfirmBtn from "@/components/_v1/confirm-btn";

export function TransactionHistoryTab() {
    const store = salesOverviewStore();
    const ctx = useEffectLoader(async () =>
        getSalesPaymentsAction(store.salesId)
    );
    if (!ctx?.data?.length) return <NoResults />;
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Received By</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ctx.data?.map((tx) => (
                        <TableRow key={tx.paymentId}>
                            <TableCell>
                                <TCell.Primary>{tx.paymentId}</TCell.Primary>
                                <TCell.Date>{tx.date}</TCell.Date>
                            </TableCell>
                            <TableCell>
                                <TCell.Secondary>
                                    {tx.paymentMethod}
                                </TCell.Secondary>
                            </TableCell>
                            <TableCell>
                                <>{tx.receivedBy}</>
                            </TableCell>
                            <TableCell>
                                <Money value={Math.abs(tx.amount)} />
                            </TableCell>
                            <TableCell>
                                <TCell.Status status={tx.status} />
                            </TableCell>
                            <TableCell>
                                <ConfirmBtn onClick={() => deleteTransaction}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
