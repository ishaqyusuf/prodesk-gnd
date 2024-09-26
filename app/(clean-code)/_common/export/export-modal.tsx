import Modal from "@/components/common/modal";
import { useExportForm } from "./use-export";
import { Form } from "@/components/ui/form";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { TableCell } from "@/app/_components/data-table/table-cells";
import { ScrollArea } from "@/components/ui/scroll-area";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";

interface Props {
    type;
    config?;
}
export default function ExportModal({ type, config }: Props) {
    const ctx = useExportForm(type, config);

    return (
        <Form {...ctx.form}>
            <Modal.Content size="sm">
                <Modal.Header title="Export" />
                <ScrollArea className="max-h-[40vh]">
                    <Table>
                        <TableBody>
                            {ctx.list?.map((ls, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <ControlledCheckbox
                                            control={ctx.form.control}
                                            name={`exports.${ls.valueNode}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TableCell.Primary>
                                            {ls?.title}
                                        </TableCell.Primary>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <Modal.Footer submitText="Export" onSubmit={ctx.startExport} />
            </Modal.Content>
        </Form>
    );
}
