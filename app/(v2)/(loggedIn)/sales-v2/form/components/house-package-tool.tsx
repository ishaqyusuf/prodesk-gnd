import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { housePackageToolTable } from "../item-form-blocks";
import { Input } from "@/components/ui/input";

interface Props {}
export default function HousePackageTool({}: Props) {
    return (
        <Table>
            <TableHeader>
                <TableHead>Width</TableHead>
                <TableHead>Left Hand Swing</TableHead>
                <TableHead>Right Hand Swing</TableHead>
                <TableHead>Unit Dimension</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Line Total</TableHead>
            </TableHeader>
            <TableBody>
                {housePackageToolTable.map((row) => (
                    <TableRow key={row.width}>
                        <TableCell>{row.width}</TableCell>
                        <TableCell>
                            <SwingInput />
                        </TableCell>
                        <TableCell>
                            <SwingInput />
                        </TableCell>
                        <TableCell>{row.dim}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
function SwingInput() {
    return (
        <>
            <Input type="number" className="w-24 h-8" />
        </>
    );
}
