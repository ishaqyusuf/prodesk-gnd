"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { screens } from "@/lib/responsive";
import { cn } from "@/lib/utils";
import { ISalesOrder } from "@/types/sales";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Layers } from "lucide-react";
import { useContext, useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useMediaQuery } from "react-responsive";
import { SalesFormContext } from "./ctx";
import AutoComplete from "@/components/common/auto-complete";
import { Label } from "@/components/ui/label";
import Money from "@/components/money";
import {
    useInvoiceLineEstimate,
    useInvoiceTotalEstimate,
} from "./use-invoice-estimate";
import { Menu, MenuItem } from "@/components/data-table/data-table-row-actions";
import { Icons } from "@/components/icons";
import { ISalesForm } from "./type";
import EstimateFooter from "./estimate-footer";
import { Button } from "@/components/ui/button";
import salesUtils from "@/app/(auth)/sales/order/[slug]/form/sales-utils";
import salesFormUtils from "./sales-form-utils";

export default function InvoiceTable() {
    const form = useFormContext<ISalesForm>();
    const { fields, append, replace } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useInvoiceTotalEstimate();
    const watchProfileEstimate = form.watch("meta.profileEstimate");
    const isMobile = useMediaQuery(screens.xs);
    const handleOndragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem as any);
        replace(items);
    };
    return (
        <div className={cn("relative", isMobile && "max-md:overflow-x-auto")}>
            <div className={cn(isMobile && "max-md:w-[900px]")}>
                <DragDropContext onDragEnd={handleOndragEnd}>
                    <Droppable droppableId="dropper1">
                        {(provided) => (
                            <Table
                                role="list"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className=""
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[25px]  px-1">
                                            #
                                        </TableHead>
                                        <TableHead className="w-5 px-1">
                                            <Layers className="h-3.5 w-3.5" />
                                        </TableHead>
                                        <TableHead className="px-1">
                                            Item
                                        </TableHead>
                                        <TableHead className="w-20  px-1">
                                            Swing
                                        </TableHead>
                                        <TableHead className="w-20 px-1">
                                            Supplier
                                        </TableHead>
                                        <TableHead className="w-14 px-1 text-center">
                                            Qty
                                        </TableHead>
                                        <TableHead className="w-20 px-1">
                                            Cost
                                        </TableHead>
                                        {watchProfileEstimate ? (
                                            <>
                                                <TableHead className="w-8 px-1">
                                                    Rate
                                                </TableHead>
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                        <TableHead className="w-8 px-1 text-right">
                                            Total
                                        </TableHead>
                                        <TableHead className="w-8 px-1 text-center">
                                            Tax
                                        </TableHead>
                                        <TableHead className="w-10 px-1"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <InvoiceTableRow
                                            key={index}
                                            field={field}
                                            index={index}
                                        />
                                    ))}

                                    {provided.placeholder}
                                </TableBody>
                            </Table>
                        )}
                    </Droppable>
                </DragDropContext>
                <div className="flex">
                    <Button
                        className="w-full"
                        onClick={() => {
                            append(salesFormUtils.moreInvoiceLines());
                        }}
                        variant="ghost"
                    >
                        More Lines
                    </Button>
                </div>
                <EstimateFooter />
            </div>
        </div>
    );
}
function InvoiceTableRow({ index, field }) {
    const { data, profileEstimate } = useContext(SalesFormContext);
    const form = useFormContext<ISalesForm>();
    const [qty, rate, total, taxxable, tax, lid] = form.watch([
        `items.${index}.qty`,
        `items.${index}.price`,
        `items.${index}.total`,
        `items.${index}.meta.tax`,
        `items.${index}.tax`,
        `items.${index}._ctx.id`,
    ] as any);
    useInvoiceLineEstimate(index, qty, rate, taxxable, lid);
    return (
        <Draggable key={index} draggableId={field.id} index={index}>
            {(provided) => {
                return (
                    <TableRow
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        key={field.id}
                        className="border-b-0 hover:bg-none"
                    >
                        <TableCell className="p-0 px-1 font-medium">
                            {index + 1}
                        </TableCell>
                        <TableCell className="p-0 px-1">
                            <InputHelper
                                index={index}
                                formKey={"meta.isComponent"}
                                checkbox
                            />
                        </TableCell>
                        <TableCell className="p-0 px-1 py-0.5">
                            <InputHelper
                                index={index}
                                formKey={"description"}
                                itemText={"description"}
                                itemValue={"description"}
                                options={data.ctx.items}
                            />
                        </TableCell>
                        <TableCell className="p-0 px-1">
                            <InputHelper
                                index={index}
                                formKey={"swing"}
                                options={data.ctx.swings}
                            />
                        </TableCell>
                        <TableCell className="p-0 px-1">
                            <InputHelper
                                index={index}
                                formKey={"supplier"}
                                options={data.ctx.suppliers}
                            />
                        </TableCell>
                        <TableCell className="p-0 px-1">
                            <InputHelper index={index} formKey={"qty"} />
                        </TableCell>
                        <TableCell className="p-0 px-1">
                            <InputHelper index={index} formKey={"price"} />
                        </TableCell>
                        {profileEstimate && (
                            <TableCell
                                align="right"
                                id="rate"
                                className="p-0 px-1"
                            >
                                <Label className="whitespace-nowrap">
                                    <Money value={rate} />
                                </Label>
                            </TableCell>
                        )}
                        <TableCell
                            align="right"
                            id="total"
                            className="p-0 px-1"
                        >
                            <Label className="whitespace-nowrap">
                                <Money value={total} />
                            </Label>
                        </TableCell>
                        <TableCell className="p-0 px-1">
                            <InputHelper
                                index={index}
                                formKey={"meta.tax"}
                                checkbox
                            />
                        </TableCell>
                        <TableCell className="p-0 px-1">
                            <Menu>
                                <MenuItem Icon={Icons.component}>
                                    Components
                                </MenuItem>
                            </Menu>
                        </TableCell>
                    </TableRow>
                );
            }}
        </Draggable>
    );
}
interface InputHelperProps {
    index;
    formKey;
    options?;
    itemText?;
    itemValue?;
    checkbox?: boolean;
    onSelect?;
    type?;
}
function InputHelper({ index, formKey, checkbox, ...props }: InputHelperProps) {
    const form = useFormContext<ISalesOrder>();
    return (
        <FormField<ISalesOrder>
            name={`items.${index}.${formKey}` as any}
            control={form.control}
            render={({ field }) =>
                checkbox ? (
                    <Checkbox
                        id="component"
                        checked={field.value as CheckedState}
                        onCheckedChange={field.onChange}
                    />
                ) : props.options ? (
                    <AutoComplete
                        uppercase
                        className="h-8 p-1 font-medium uppercase"
                        {...props}
                        {...field}
                    />
                ) : (
                    <Input
                        className="h-8 p-1 uppercase font-medium"
                        {...field}
                    />
                )
            }
        />
    );
}
