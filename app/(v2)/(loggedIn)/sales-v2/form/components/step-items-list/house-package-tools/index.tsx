import { useEffect } from "react";
import { useMultiComponentItem } from "../../../_hooks/use-multi-component-item";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import HousePackageSizeLineItem from "./size-line-item";
import Money from "@/components/_v1/money";
import { Button } from "@/components/ui/button";
import SelectDoorHeightsModal from "../../modals/select-door-heights";
import { useModal } from "@/components/common/modal/provider";
export default function HousePackageTool({ componentTitle }) {
    const componentItem = useMultiComponentItem(componentTitle);
    const { item, form, _setSizeList } = componentItem;

    useEffect(() => {
        componentItem.initializeSizes();
    }, []);
    const modal = useModal();
    function editSize() {
        modal.openModal(
            <SelectDoorHeightsModal
                form={form}
                rowIndex={item.rowIndex}
                productTitle={componentTitle}
                onSubmit={_setSizeList}
            />
        );
    }
    return (
        <>
            <Table>
                <TableHeader>
                    <TableHead>Width</TableHead>
                    {componentItem.isBifold || componentItem.isSlab ? (
                        <>
                            <TableHead className="w-[100px]">Qty</TableHead>
                        </>
                    ) : (
                        <>
                            <TableHead className="w-[100px]">LH</TableHead>
                            <TableHead className="w-[100px]">RH</TableHead>
                        </>
                    )}

                    <TableHead>Unit Dimension</TableHead>
                    <TableHead className="">
                        {componentItem.isBifold || componentItem.isSlab ? (
                            <>Price</>
                        ) : (
                            <div className="flex max-w-[300px] flex-col justify-center items-stretch divide-y">
                                <div className="flex pb-1 justify-center">
                                    <p>Price</p>
                                </div>
                                <div className="flex pt-1 justify-between">
                                    {componentItem.prices.map((p) => (
                                        <div className="flex-1" key={p.title}>
                                            {p.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Line Total</TableHead>
                </TableHeader>
                <TableBody>
                    {componentItem.sizeList.map((row) => (
                        <HousePackageSizeLineItem
                            size={row}
                            componentItem={componentItem}
                            key={row.dim}
                        ></HousePackageSizeLineItem>
                    ))}
                    <TableRow>
                        <TableCell
                            colSpan={
                                componentItem.isBifold || componentItem.isSlab
                                    ? 4
                                    : 5
                            }
                        ></TableCell>
                        <TableCell>
                            {/* <Money value={componentItem.unitPrice} /> */}
                        </TableCell>
                        <TableCell>
                            <Money value={componentItem.doorTotalPrice} />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <div className="flex justify-end gap-4">
                <Button onClick={editSize} type="button" variant={"outline"}>
                    Edit Size
                </Button>
            </div>
        </>
    );
}
