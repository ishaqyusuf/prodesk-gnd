import { useEffect } from "react";
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
import { useModal } from "@/components/common/modal/provider";
import { useMultiComponentItem } from "../../../../../_hooks/use-multi-component-item";
import SelectDoorHeightsModal from "../../../../modals/select-door-heights";
import { getDykeStepDoorByProductId } from "../../../../../_action/get-dyke-step-doors";
import { useDoorSizes } from "../../../../../_hooks/use-door-size";
export default function HousePackageTool({ componentTitle }) {
    const componentItem = useMultiComponentItem(componentTitle);
    const { item, form, _setSizeList, doorConfig } = componentItem;

    useEffect(() => {
        componentItem.initializeSizes();
    }, []);
    const modal = useModal();
    const { sizes, isType } = useDoorSizes(form, item.rowIndex, componentTitle);
    async function editSize() {
        const i = item.get.data();
        const formStep = i.item.formStepArray.find(
            (s) => s.step.title == "Door"
        );
        const dykeProductId = i.item.housePackageTool.dykeDoorId;
        console.log({ dykeProductId, formStep });
        const stepProd = await getDykeStepDoorByProductId(
            formStep.step.id,
            dykeProductId
        );
        // console.log(stepProd);
        modal.openModal(
            <SelectDoorHeightsModal
                form={form}
                rowIndex={item.rowIndex}
                stepProd={stepProd}
                productTitle={componentTitle}
                onSubmit={_setSizeList}
            />
        );
    }
    return (
        <>
            <Table>
                <TableHeader>
                    <TableHead>Dimension</TableHead>
                    {componentItem.isComponent.garage && (
                        <TableHead>Swing</TableHead>
                    )}
                    {doorConfig.singleHandle ? (
                        <>
                            <TableHead className="w-[100px]">Qty</TableHead>
                        </>
                    ) : (
                        <>
                            <TableHead className="w-[100px]">LH</TableHead>
                            <TableHead className="w-[100px]">RH</TableHead>
                        </>
                    )}

                    {/* <TableHead>Unit Dimension</TableHead> */}
                    {componentItem.calculatedPriceMode ? (
                        <>
                            <TableHead className="hidden lg:table-cell">
                                Estimate
                            </TableHead>
                            <TableHead className="">Addon/Qty</TableHead>
                        </>
                    ) : (
                        <>
                            <TableHead className="hidden lg:table-cell">
                                Price
                            </TableHead>
                        </>
                    )}
                    <TableHead className="hidden lg:table-cell">
                        Line Total
                    </TableHead>
                    <TableHead></TableHead>
                </TableHeader>
                <TableBody>
                    {sizes.map((row) => (
                        <HousePackageSizeLineItem
                            size={row}
                            componentItem={componentItem}
                            key={row.dim}
                        ></HousePackageSizeLineItem>
                    ))}
                    <TableRow>
                        <TableCell
                            className="hidden lg:table-cell"
                            colSpan={doorConfig.singleHandle ? 4 : 5}
                        ></TableCell>
                        <TableCell
                            className="lg:hidden"
                            colSpan={doorConfig.singleHandle ? 3 : 4}
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
            {/* <div className="flex justify-end gap-4">
                <Button onClick={editSize} type="button" variant={"outline"}>
                    Edit Size
                </Button>
            </div> */}
        </>
    );
}
