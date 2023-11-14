import PageHeader from "@/components/page-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ISalesOrder } from "@/types/sales";
import { useState } from "react";

interface Props {
    form;
    order: ISalesOrder;
}
export default function OrderInspection({ form, order }: Props) {
    const [checkAll, setCheckAll] = useState(false);
    return (
        <div className="space-y-4">
            <PageHeader
                title={order?.orderId}
                subtitle={
                    <div>
                        {order?.shippingAddress?.name}
                        {" | "}
                        {order?.shippingAddress?.address1}
                    </div>
                }
            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-2">
                            <Checkbox
                                checked={checkAll}
                                onCheckedChange={e => {
                                    setCheckAll(e as any);
                                    // if(e) {
                                    order?.items?.map(item => {
                                        form.setValue(
                                            `loader.${order?.slug}.${item.meta.uid}.checked` as any,
                                            e
                                        );
                                    });
                                    // }
                                }}
                            />
                        </TableHead>
                        <TableHead className="px-2">Items</TableHead>
                        <TableHead className="px-2">Qty</TableHead>
                        <TableHead className="px-2">Load Qty</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {order?.items?.map((item, i) => (
                        <BackOrderLine
                            order={order}
                            key={i}
                            form={form}
                            item={item}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
function BackOrderLine({ form, order, item }) {
    const checked = form.watch(`backOrders.${item.meta.uid}.checked`);
    return (
        <TableRow
            className={cn(checked && "bg-green-100 hover:bg-green-100")}
            key={item.id}
        >
            <TableCell className="p-0 px-2">
                {/* <FormField
                                                            control={
                                                                form.control
                                                            }
                                                            name={
                                                                `backOrders.${item.meta.uid}.checked` as any
                                                            }
                                                            render={({
                                                                field
                                                            }) => (
                                                                <FormItem className="">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={
                                                                                field.value as any
                                                                            }
                                                                            onCheckedChange={
                                                                                field.onChange
                                                                            }
                                                                            // onCheckedChange={e => {
                                                                            //     field.onChange(
                                                                            //         e
                                                                            //     );

                                                                            //     // setCheckAll(
                                                                            //     //     Object.values(
                                                                            //     //         form.getValues(
                                                                            //     //             "backOrders"
                                                                            //     //         )
                                                                            //     //     ).filter(
                                                                            //     //         f =>
                                                                            //     //             (f as any)
                                                                            //     //                 .checked
                                                                            //     //     )
                                                                            //     //         .length ==
                                                                            //     //         data
                                                                            //     //             .items
                                                                            //     //             ?.length
                                                                            //     // );
                                                                            // }}
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        /> */}
            </TableCell>
            <TableCell
                onClick={e => {
                    form.setValue(
                        `loader.${order?.slug}.${item.meta.uid}.checked`,
                        !checked
                    );
                }}
                className={cn("p-2 uppercase cursor-pointer")}
            >
                <p className="text-primary">{item.description}</p>
            </TableCell>
            <TableCell className={"p-2"}>
                <p className="text-primary">
                    {item.qty - (item?.meta?.produced_qty || 0)}
                </p>
            </TableCell>
            <TableCell className={"p-2"}>
                <Input
                    type="number"
                    {...form.register(
                        `loader.${order?.slug}.${item.meta.uid}.backQty` as any
                    )}
                    className="w-16 h-7"
                />
            </TableCell>
        </TableRow>
    );
}
