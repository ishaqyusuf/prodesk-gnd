import { useDataPage } from "@/lib/data-page-context";
import { SalesOverviewType } from "../overview-shell";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Money from "@/components/_v1/money";

export default function MouldingItems() {
    const { data } = useDataPage<SalesOverviewType>();
    if (!data.groupings.doors?.length) return <></>;
    return data.groupings.doors.map((moulding, index) => (
        <div key={index}>
            <div className="border-b uppercase p-2 bg-blue-50">
                <Label>
                    {moulding.meta.doorType} Door: Section {index + 1}
                </Label>
            </div>
            <Table>
                <TableHeader>
                    <TableHead>#</TableHead>
                    <TableHead>Item</TableHead>
                    {moulding.isType.hasSwing ? (
                        <>
                            <TableHead>LH</TableHead>
                            <TableHead>RH</TableHead>
                        </>
                    ) : (
                        <TableHead>Qty</TableHead>
                    )}
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                </TableHeader>
                {moulding.multiDykeComponents.map((com, cid) => (
                    <TableBody key={com.id}>
                        {com.housePackageTool?.doors.map((door) => (
                            <TableRow key={door.id}>
                                <TableCell>{cid + 1}</TableCell>
                                <TableCell>
                                    {com.housePackageTool?.door?.title}
                                </TableCell>
                                {moulding.isType.hasSwing ? (
                                    <>
                                        <TableHead>{door.lhQty}</TableHead>
                                        <TableHead>{door.rhQty}</TableHead>
                                    </>
                                ) : (
                                    <TableCell>{com.qty}</TableCell>
                                )}

                                <TableCell>
                                    <Money value={com.rate} />
                                </TableCell>
                                <TableCell>
                                    <Money value={com.total} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                ))}
            </Table>
        </div>
    ));
}
