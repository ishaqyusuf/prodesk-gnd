import { TableCell, TableRow } from "@/components/ui/table";
import {
    useMultiComponentItem,
    useMultiComponentSizeRow,
} from "../../_hooks/use-multi-component-item";
import ControlledInput from "@/components/common/controls/controlled-input";
import { cn } from "@/lib/utils";
import Money from "@/components/_v1/money";

interface Props {
    size: { dim; width };
    componentItem: ReturnType<typeof useMultiComponentItem>;
}
export default function HousePackageSizeLineItem({
    size,
    componentItem,
}: Props) {
    const sizeRow = useMultiComponentSizeRow(componentItem, size);
    const { form, prices } = componentItem;

    return (
        <TableRow>
            <TableCell>{size.width}</TableCell>
            <TableCell>
                <ControlledInput
                    type="number"
                    list
                    control={form.control}
                    name={`${sizeRow.keys.lhQty}` as any}
                />
            </TableCell>
            {componentItem.isBifold ? (
                <></>
            ) : (
                <>
                    <TableCell>
                        <ControlledInput
                            type="number"
                            list
                            control={form.control}
                            name={`${sizeRow.keys.rhQty}` as any}
                        />
                    </TableCell>
                </>
            )}
            <TableCell>{size.dim?.replaceAll("in", '"')}</TableCell>
            <TableCell className="">
                <div className="flex max-w-[300px] flex-col justify-center items-stretch divide-y">
                    <div className="flex pt-1 justify-between">
                        {prices.map((p) => (
                            <div className="flex-1" key={p.title}>
                                <div className="mx-1">
                                    <ControlledInput
                                        type="number"
                                        className={cn(
                                            prices.length == 1 && "w-[80px]"
                                        )}
                                        control={form.control}
                                        list
                                        name={
                                            `${
                                                sizeRow.keys[p.key as any]
                                            }` as any
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Money value={sizeRow.unitPrice} />
            </TableCell>
            <TableCell>
                <Money value={sizeRow.lineTotal} />
            </TableCell>
        </TableRow>
    );
}
