import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Context, useCreateContext, useCtx } from "./ctx";
import { useForm } from "react-hook-form";
import { InputHTMLAttributes, useEffect } from "react";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/common/controls/controlled-input";
import { MoneyBadge } from "@/components/(clean-code)/money-badge";
import { DataLine } from "@/components/(clean-code)/data-table/Dl";
import { Menu } from "@/components/(clean-code)/menu";
import Money from "@/components/_v1/money";
import { Label } from "@/components/ui/label";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { cn } from "@/lib/utils";
import { ServiceClass } from "../../_utils/helpers/zus/service-class";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import TextWithTooltip from "@/components/(clean-code)/custom/text-with-tooltip";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { Input } from "@/components/ui/input";

interface Props {
    itemStepUid;
}
export default function ServiceLineItem({ itemStepUid }: Props) {
    const ctx = useCreateContext(itemStepUid);
    return (
        <>
            <Context.Provider value={ctx}>
                <Table className="p-4 text-xs font-medium">
                    <TableHeader>
                        <TableRow className="uppercase">
                            <TableHead>Sn.</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-24">Tax</TableHead>
                            <TableHead className="">
                                <TextWithTooltip
                                    text={"Production"}
                                    className="w-16"
                                ></TextWithTooltip>
                            </TableHead>
                            <TableHead className="w-28">Qty</TableHead>
                            <TableHead className="w-32">Unit Price</TableHead>

                            <TableHead className="w-32">Line Total</TableHead>
                            <TableHead className="w-20"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ctx.itemIds?.map((m, index) => (
                            <MouldingRow sn={index + 1} lineUid={m} key={m} />
                        ))}
                    </TableBody>
                    <TableFooter className="bg-accent">
                        <TableRow>
                            <TableCell>
                                <Button
                                    onClick={() => {
                                        ctx.ctx.addServiceLine();
                                    }}
                                >
                                    <Icons.add className="w-4 h-4 mr-2" />
                                    <span>Line</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </Context.Provider>
        </>
    );
}
function MouldingRow({ lineUid, sn }: { sn; lineUid }) {
    const ctx = useCtx();
    const mfd = ctx.itemForm?.groupItem?.form?.[lineUid];

    return (
        <>
            <TableRow className={cn(!mfd?.selected && "hidden")}>
                <TableCell className="font-mono">{sn}.</TableCell>
                <TableCell className="font-mono font-medium text-sm">
                    <Input
                        defaultValue={mfd?.meta?.description}
                        onChange={(e) => {
                            ctx.ctx.dotUpdateGroupItemFormPath(
                                lineUid,
                                "meta.description",
                                e.target.value
                            );
                        }}
                    />
                </TableCell>
                <TableCell>
                    <Switch
                        defaultChecked={mfd?.meta?.taxxable}
                        onCheckedChange={(e) => {
                            ctx.ctx.dotUpdateGroupItemFormPath(
                                lineUid,
                                "meta.taxxable",
                                e
                            );
                        }}
                    />
                </TableCell>
                <TableCell>
                    <Switch
                        defaultChecked={mfd?.meta?.produceable}
                        onCheckedChange={(e) => {
                            ctx.ctx.dotUpdateGroupItemFormPath(
                                lineUid,
                                "meta.produceable",
                                e
                            );
                        }}
                    />
                </TableCell>
                <TableCell>
                    <Input
                        type="number"
                        defaultValue={mfd?.qty?.total}
                        onChange={(e) => {
                            ctx.ctx.dotUpdateGroupItemFormPath(
                                lineUid,
                                "qty.total",
                                +e.target.value
                            );
                        }}
                    />
                </TableCell>

                <TableCell>
                    <Input
                        type="number"
                        defaultValue={mfd?.addon}
                        onChange={(e) => {
                            ctx.ctx.dotUpdateGroupItemFormPath(
                                lineUid,
                                "addon",
                                +e.target.value
                            );
                        }}
                    />
                </TableCell>
                <TableCell>
                    <Money value={mfd?.totalSalesPrice} />
                </TableCell>
                <TableCell align="right">
                    <ConfirmBtn
                        onClick={() => {
                            ctx.ctx.removeGroupItem(lineUid);
                        }}
                        trash
                        size="icon"
                    />
                </TableCell>
            </TableRow>
        </>
    );
}
