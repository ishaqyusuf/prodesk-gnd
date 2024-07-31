import { useModal } from "@/components/common/modal/provider";
import { useForm, UseFormReturn } from "react-hook-form";
import { DykeForm } from "../../../type";
import { Form } from "@/components/ui/form";
import Modal from "@/components/common/modal";
import { useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useDoorSizes } from "../../_hooks/use-door-size";
import Money from "@/components/_v1/money";
import { ScrollArea } from "@/components/ui/scroll-area";
import ControlledInput from "@/components/common/controls/controlled-input";
import { TableCol } from "@/components/common/data-table/table-cells";
import { HousePackageToolMeta } from "@/types/sales";

interface Props {
    rowIndex;
    productTitle;
    form: UseFormReturn<DykeForm>;
}
export function useDoorSizeModal(form, rowIndex) {
    const modal = useModal();
    return {
        open(productTitle) {
            modal.openModal(
                <DoorSizeModal
                    form={form}
                    productTitle={productTitle}
                    rowIndex={rowIndex}
                />
            );
        },
    };
}
export default function DoorSizeModal({ rowIndex, productTitle, form }: Props) {
    const basePath = `itemArray.${rowIndex}.multiComponent.components.${productTitle}`;
    const defaultValues = {};

    const _form = useForm<{
        [size in string]: {
            // qty?: number;
            swing?: string;
            jambSizePrice?: number;
            // price?: number;
            lhQty?: number;
            rhQty?: number;
        };
    }>({
        defaultValues,
    });
    const { sizes, isType } = useDoorSizes(form, rowIndex, productTitle);

    useEffect(() => {
        const _values = {};
        const doors = form.getValues(`${basePath}._doorForm` as any);
        console.log({ doors });
        Object.entries(doors || {}).map(([size, doorForm]) => {
            const { swing, jambSizePrice, lhQty, rhQty } = doorForm as any;
            _values[size] = {
                swing,
                jambSizePrice,
                lhQty,
                rhQty,
            };
        });
        _form.reset(_values);
    }, []);
    const modal = useModal();
    function onSubmit() {
        const doors = form.getValues(`${basePath}._doorForm` as any) || {};

        const priceTags: HousePackageToolMeta["priceTags"] = form.getValues(
            `${basePath}.priceTags` as any
        ) || {
            doorSizePriceTag: {},
        };
        const _formData = _form.getValues();
        let newDoorForm = {};
        Object.entries(_formData).map(
            ([size, { jambSizePrice, lhQty, rhQty, swing }]) => {
                const existingData = doors[size] || {};
                const price = (priceTags.doorSizePriceTag[size] = sizes.find(
                    (s) => s.dim == size
                )?.price);
                newDoorForm[size] = {
                    ...existingData,
                    swing,
                    lhQty,
                    rhQty,
                    jambSizePrice: price,
                };
            }
        );
        // console.log({ newDoorForm });
        // return;
        form.setValue(`${basePath}._doorForm` as any, newDoorForm);
        form.setValue(`${basePath}.checked` as any, true);
        // console.log(_formData);
        modal.close();
    }
    function onCancel() {
        form.setValue(`${basePath}.checked` as any, false);
    }
    return (
        <Form {..._form}>
            <Modal.Content size="lg">
                <Modal.Header
                    title={"Select Door Sizes"}
                    subtitle={productTitle}
                />
                <div className="">
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead colSpan={4}>Size</TableHead>
                                {isType.hasSwing && (
                                    <TableHead colSpan={3}>Swing</TableHead>
                                )}
                                <TableHead colSpan={2}>
                                    {isType.multiHandles ? "LH" : "Qty"}
                                </TableHead>
                                {isType.multiHandles && (
                                    <TableHead colSpan={2}>RH</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                    </Table>
                    <ScrollArea className="max-h-[45vh] overflow-auto">
                        <Table className="table-fixed">
                            <TableBody>
                                {sizes.map((size) => (
                                    <TableRow key={size.dim}>
                                        <TableCell colSpan={4}>
                                            <TableCol.Primary>
                                                {size.dimFt}
                                            </TableCol.Primary>
                                            <TableCol.Secondary>
                                                <Money value={size.price} />
                                            </TableCol.Secondary>
                                        </TableCell>
                                        {isType.garage && (
                                            <TableCell colSpan={3}>
                                                <ControlledInput
                                                    control={_form.control}
                                                    className="w-full"
                                                    name={`${size.dim}.swing`}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell colSpan={2}>
                                            <ControlledInput
                                                type="number"
                                                className="w-full"
                                                control={_form.control}
                                                name={`${size.dim}.lhQty`}
                                            />
                                        </TableCell>
                                        {isType.multiHandles && (
                                            <TableCell colSpan={2}>
                                                <ControlledInput
                                                    type="number"
                                                    className="w-full"
                                                    control={_form.control}
                                                    name={`${size.dim}.rhQty`}
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                <Modal.Footer
                    submitText="Proceed"
                    onSubmit={onSubmit}
                    cancelText="Remove Door"
                    onCancel={onCancel}
                />
            </Modal.Content>
        </Form>
    );
}
