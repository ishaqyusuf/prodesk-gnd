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
import { screens } from "@/lib/responsive";
import { cn } from "@/lib/utils";
import { ISalesOrder } from "@/types/sales";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Layers } from "lucide-react";
import { useContext } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useMediaQuery } from "react-responsive";
import { SalesFormContext } from "./ctx";
import AutoComplete from "@/components/common/auto-complete";
import { Label } from "@/components/ui/label";
import Money from "@/components/money";
import { useInvoiceEstimate } from "./use-invoice-estimate";
import { Menu, MenuItem } from "@/components/data-table/data-table-row-actions";
import { Icons } from "@/components/icons";

export default function InvoiceTable() {
    const form = useFormContext<ISalesOrder>();
    const { fields } = useFieldArray({
        control: form.control,
        name: "items",
    });
    const watchProfileEstimate = form.watch("meta.profileEstimate");
    const isMobile = useMediaQuery(screens.xs);
    return (
        <div className={cn("relative", isMobile && "max-md:overflow-x-auto")}>
            <div className={cn(isMobile && "max-md:w-[900px]")}>
                <Table className="">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[25px]  px-1">#</TableHead>
                            <TableHead className="w-5 px-1">
                                <Layers className="h-3.5 w-3.5" />
                            </TableHead>
                            <TableHead className="px-1">Item</TableHead>
                            <TableHead className="w-20  px-1">Swing</TableHead>
                            <TableHead className="w-20 px-1">
                                Supplier
                            </TableHead>
                            <TableHead className="w-14 px-1 text-center">
                                Qty
                            </TableHead>
                            <TableHead className="w-20 px-1">Cost</TableHead>
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
                            <InvoiceTableRow key={index} index={index} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
function InvoiceTableRow({ index }) {
    const { data, profileEstimate } = useContext(SalesFormContext);
    const form = useFormContext<ISalesOrder>();
    const rate = form.watch(`items.${index}.rate`);
    const total = form.watch(`items.${index}.total`);
    const e = useInvoiceEstimate(index);

    return (
        <TableRow className="border-b-0 hover:bg-none">
            <TableCell className="p-0 px-1 font-medium">{index + 1}</TableCell>
            <TableCell className="p-0 px-1">
                <InputHelper
                    index={index}
                    formKey={"meta.isComponent"}
                    checkbox
                />
            </TableCell>
            <TableCell className="p-0 px-1">
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
                    options={data.ctx.swings}
                />
            </TableCell>
            <TableCell className="p-0 px-1">
                <InputHelper index={index} formKey={"qty"} />
            </TableCell>
            <TableCell className="p-0 px-1">
                <InputHelper index={index} formKey={"price"} />
            </TableCell>
            {profileEstimate && (
                <TableCell align="right" id="rate" className="p-0 px-1">
                    <Label className="whitespace-nowrap">
                        <Money value={rate} />
                    </Label>
                </TableCell>
            )}
            <TableCell align="right" id="total" className="p-0 px-1">
                <Label className="whitespace-nowrap">
                    <Money value={total} />
                </Label>
            </TableCell>
            <TableCell className="p-0 px-1">
                <InputHelper index={index} formKey={"meta.tax"} checkbox />
            </TableCell>
            <TableCell className="p-0 px-1">
                <Menu>
                    <MenuItem Icon={Icons.component}>Components</MenuItem>
                </Menu>
            </TableCell>
        </TableRow>
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
