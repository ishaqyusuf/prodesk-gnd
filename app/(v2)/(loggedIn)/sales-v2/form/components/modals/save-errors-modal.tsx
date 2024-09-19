import Modal from "@/components/common/modal";
import useEffectLoader from "@/lib/use-effect-loader";
import { loadDykeErrors } from "../../_action/error/save-error";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/use-day";
import { TableCell } from "@/app/_components/data-table/table-cells";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/_v1/status-badge";
import { openLink } from "@/lib/open-link";

export default function SaveErrorsModal() {
    const data = useEffectLoader(loadDykeErrors);
    return (
        <Modal.Content>
            <Modal.Header title="Save Error Data" />
            <ScrollArea className="h-[80vh]">
                <Table>
                    <TableBody>
                        {data.ready &&
                            data.data?.map((order) => (
                                <TableRow
                                    className="cursor-pointer"
                                    onClick={() => {
                                        const orderId =
                                            order.meta?.data?.order?.orderId;

                                        openLink(
                                            `/sales-v2/form/${
                                                order.meta?.data?.order?.type
                                            }${orderId || ""}`,
                                            { errorId: order.errorId },
                                            true
                                        );
                                    }}
                                    key={order.id}
                                >
                                    <TableCell>
                                        <TableCell.Primary className="uppercase">
                                            {order.errorId}
                                        </TableCell.Primary>
                                        <TableCell.Secondary>
                                            {formatDate(order.createdAt)}
                                        </TableCell.Secondary>
                                    </TableCell>
                                    <TableCell>
                                        <TableCell.Primary>
                                            {order.meta?.data?.salesRep?.name}
                                        </TableCell.Primary>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge>
                                            {order.restoredAt
                                                ? "Restored"
                                                : "Not restored"}
                                        </StatusBadge>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </Modal.Content>
    );
}
