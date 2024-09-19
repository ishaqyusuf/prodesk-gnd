import Modal from "@/components/common/modal";
import useEffectLoader from "@/lib/use-effect-loader";
import { loadDykeErrors } from "../../_action/error/save-error";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/use-day";
import { TableCell } from "@/app/_components/data-table/table-cells";
import { ScrollArea } from "@/components/ui/scroll-area";

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
                                        console.log(order);
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
                                            {order.meta?.message}
                                        </TableCell.Primary>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </Modal.Content>
    );
}
