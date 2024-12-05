import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Context, useCreateContext, useCtx } from "./ctx";
import { MouldingClass } from "../../_utils/helpers/zus/moulding-class";
import { useForm } from "react-hook-form";
import { InputHTMLAttributes } from "react";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/common/controls/controlled-input";
import { MoneyBadge } from "@/components/(clean-code)/money-badge";
import { DataLine } from "@/components/(clean-code)/data-table/Dl";
import { Menu } from "@/components/(clean-code)/menu";
import Money from "@/components/_v1/money";
import { Label } from "@/components/ui/label";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { cn } from "@/lib/utils";

interface Props {
    itemStepUid;
}
export default function MouldingLineItem({ itemStepUid }: Props) {
    const ctx = useCreateContext(itemStepUid);
    return (
        <>
            <Context.Provider value={ctx}>
                <Table className="p-4 text-xs font-medium">
                    <TableHeader>
                        <TableRow className="uppercase">
                            <TableHead>Sn.</TableHead>
                            <TableHead>Moulding</TableHead>
                            <TableHead className="w-32">Qty</TableHead>
                            <TableHead className="w-32">Estimate</TableHead>
                            <TableHead className="w-32">Addon/Qty</TableHead>
                            <TableHead className="w-32">Line Total</TableHead>
                            <TableHead className="w-32"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ctx.mouldings?.map((m, index) => (
                            <MouldingRow sn={index + 1} data={m} key={m.uid} />
                        ))}
                    </TableBody>
                </Table>
            </Context.Provider>
        </>
    );
}
function MouldingRow({
    data,
    sn,
}: {
    sn;
    data: ReturnType<
        MouldingClass["getMouldingLineItemForm"]
    >["mouldings"][number];
}) {
    const ctx = useCtx();
    const mfd = ctx.itemForm?.groupItem?.form?.[data.uid];
    const form = useForm({
        defaultValues: mfd,
    });
    const watchForm = form.watch();
    const inputProps: InputHTMLAttributes<HTMLInputElement> = {
        onBlur: async (e) => {
            await new Promise((res) => {
                ctx.ctx.updateGroupItemForm(data.uid, watchForm);
                setTimeout(() => {
                    res(true);
                }, 200);
            });
        },
    };

    return (
        <Form {...form}>
            <TableRow className={cn(!mfd?.selected && "hidden")}>
                <TableCell className="font-mono">{sn}.</TableCell>
                <TableCell className="font-mono font-medium text-sm">
                    {data.title}
                </TableCell>
                <TableCell>
                    <ControlledInput
                        size="sm"
                        type="number"
                        control={form.control}
                        name="qty.total"
                        inputProps={inputProps}
                    />
                </TableCell>
                <TableCell className="">
                    <Menu
                        noSize
                        Icon={null}
                        label={<Money value={mfd?.totalSalesPrice} />}
                    >
                        <div className="p-2 min-w-[300px]">
                            <div>
                                <Label>Price Summary</Label>
                            </div>
                            <dl>
                                {ctx.pricedSteps?.map((step) => (
                                    <DataLine
                                        size="sm"
                                        key={step.title}
                                        label={step.title}
                                        value={
                                            <div className="flex gap-4 items-center justify-end">
                                                <span>{step.value}</span>
                                                <MoneyBadge>
                                                    {step.price}
                                                </MoneyBadge>
                                            </div>
                                        }
                                    />
                                ))}
                                <DataLine
                                    size="sm"
                                    label="Door"
                                    value={
                                        <div className="flex gap-4 items-center justify-end">
                                            <span className="line-clamp-2 max-w-xs">{`${data.title}`}</span>
                                            <MoneyBadge>
                                                {data.basePrice?.price}
                                            </MoneyBadge>
                                        </div>
                                    }
                                />
                            </dl>
                        </div>
                    </Menu>
                </TableCell>
                <TableCell>
                    <ControlledInput
                        type="number"
                        size="sm"
                        control={form.control}
                        name="addon"
                        inputProps={inputProps}
                    />
                </TableCell>
                <TableCell>
                    <Money value={mfd?.totalSalesPrice} />
                </TableCell>
                <TableCell align="right">
                    <ConfirmBtn
                        onClick={() => {
                            ctx.ctx.removeGroupItem(data.uid);
                        }}
                        trash
                        size="icon"
                    />
                </TableCell>
            </TableRow>
        </Form>
    );
}
