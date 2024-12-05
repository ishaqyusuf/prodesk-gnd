import { InputHTMLAttributes, memo, useEffect, useMemo } from "react";
import { Context, useCreateContext, useCtx } from "./ctx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextWithTooltip from "@/components/(clean-code)/custom/text-with-tooltip";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { Menu } from "@/components/(clean-code)/menu";
import { DropdownMenuShortcut } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Money from "@/components/_v1/money";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/common/controls/controlled-input";
import { DataLine } from "@/components/(clean-code)/data-table/Dl";
import { Label } from "@/components/ui/label";
import { MoneyBadge } from "@/components/(clean-code)/money-badge";
import { LineInput } from "../line-input";

interface Props {
    itemStepUid;
}
export default function HousePackageTool({ itemStepUid }: Props) {
    const ctx = useCreateContext(itemStepUid);

    return (
        <div className="">
            <Context.Provider value={ctx}>
                <Tabs
                    onValueChange={(e) => {
                        ctx.ctx.tabChanged(e);
                    }}
                    defaultValue={ctx.tabUid}
                >
                    <TabsList>
                        {ctx.doors?.map((door) => (
                            <TabsTrigger key={door.uid} value={door.uid}>
                                <TextWithTooltip
                                    className="max-w-[160px]"
                                    text={door.title}
                                />
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {ctx.doors?.map((door) => (
                        <TabsContent key={door.uid} value={door.uid}>
                            <DoorSizeTable door={door} />
                        </TabsContent>
                    ))}
                </Tabs>
            </Context.Provider>
        </div>
    );
}
function DoorSizeTable({ door }) {
    const ctx = useCtx();

    return (
        <Table className="p-4 text-xs font-medium">
            <TableHeader>
                <TableRow className="uppercase">
                    <TableHead>Size</TableHead>
                    {ctx.config.hasSwing && <TableHead>Swing</TableHead>}
                    {ctx.config.noHandle ? (
                        <TableHead className="w-32">Swing</TableHead>
                    ) : (
                        <>
                            <TableHead className="w-28">Lh</TableHead>
                            <TableHead className="w-28">Rh</TableHead>
                        </>
                    )}
                    <TableHead className="w-32">Estimate</TableHead>
                    <TableHead className="w-32">Addon/Qty</TableHead>
                    <TableHead className="w-32">Line Total</TableHead>
                    <TableHead className="w-32"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {door.sizeList.map((sl) => (
                    <DoorSizeRow size={sl} key={sl.path} />
                ))}
            </TableBody>

            <TableFooter className="bg-accent">
                <TableRow>
                    <TableCell>
                        <Menu
                            Trigger={
                                <Button>
                                    <Icons.add className="w-4 h-4 mr-2" />
                                    <span>Size</span>
                                </Button>
                            }
                        >
                            {door.sizeList.map((sl) => (
                                <Menu.Item
                                    onClick={() => {
                                        ctx.ctx.addHeight(sl);
                                    }}
                                    key={sl.path}
                                    disabled={sl.selected}
                                >
                                    {sl.title}
                                    {sl.basePrice?.price && (
                                        <DropdownMenuShortcut>
                                            <Badge>
                                                <Money
                                                    value={sl.basePrice.price}
                                                />
                                            </Badge>
                                        </DropdownMenuShortcut>
                                    )}
                                </Menu.Item>
                            ))}
                        </Menu>
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    );
}
function DoorSizeRow({ size }: { size }) {
    const lineUid = size.path;
    const ctx = useCtx();
    const sizeForm = ctx.itemForm?.groupItem.form[size.path];

    return (
        <TableRow className={cn(!size.selected && "hidden")}>
            <TableCell className="font-mono font-semibold text-sm">
                {size.title}
            </TableCell>
            {ctx.config.hasSwing && <TableCell>Swing</TableCell>}
            {ctx.config.noHandle ? (
                <TableCell>
                    <LineInput
                        cls={ctx.ctx}
                        name="qty.total"
                        lineUid={lineUid}
                        type="number"
                    />
                </TableCell>
            ) : (
                <>
                    <TableCell className="">
                        <LineInput
                            cls={ctx.ctx}
                            name="qty.lh"
                            lineUid={lineUid}
                            type="number"
                        />
                    </TableCell>
                    <TableCell className="">
                        <LineInput
                            cls={ctx.ctx}
                            name="qty.rh"
                            lineUid={lineUid}
                            type="number"
                        />
                    </TableCell>
                </>
            )}
            <TableCell className="">
                <Menu
                    noSize
                    Icon={null}
                    label={<Money value={sizeForm?.totalSalesPrice} />}
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
                                        <span>{`${size.title}`}</span>
                                        <MoneyBadge>{size.price}</MoneyBadge>
                                    </div>
                                }
                            />
                        </dl>
                    </div>
                </Menu>
            </TableCell>
            <TableCell>
                <LineInput
                    cls={ctx.ctx}
                    name="addon"
                    lineUid={lineUid}
                    type="number"
                />
            </TableCell>
            <TableCell>
                <Money value={sizeForm?.totalSalesPrice} />
            </TableCell>
            <TableCell align="right">
                <ConfirmBtn
                    onClick={() => {
                        ctx.ctx.removeGroupItem(size.path);
                    }}
                    trash
                    size="icon"
                />
            </TableCell>
        </TableRow>
    );
}
