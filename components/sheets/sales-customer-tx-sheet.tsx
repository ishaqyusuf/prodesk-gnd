"use client";

import {
    GetSalesCustomerTxOverview,
    getSalesCustomerTxOverviewAction,
} from "@/actions/get-sales-customers-tx";
import Modal from "../common/modal";
import { _modal } from "../common/modal/provider";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import Money from "../_v1/money";

export async function openSalesCustomerTx(tid) {
    const res = await getSalesCustomerTxOverviewAction(tid);
    _modal.openSheet(<SalesCustomerTxSheet data={res} />);
}

function SalesCustomerTxSheet({ data }: { data: GetSalesCustomerTxOverview }) {
    return (
        <Modal.Content>
            <Modal.Header title={`${data.wallet?.accountNo} | #${data.id}`} />
            <Modal.ScrollArea>
                <Table>
                    <TableBody>
                        {data.salesPayments?.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.orderId}</TableCell>
                                <TableCell>{p.order.orderId}</TableCell>
                                <TableCell>
                                    <Money value={p.amount} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Modal.ScrollArea>
        </Modal.Content>
    );
}
