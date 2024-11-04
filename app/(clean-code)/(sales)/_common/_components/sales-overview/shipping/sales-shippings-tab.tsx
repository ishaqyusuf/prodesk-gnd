import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Money from "@/components/_v1/money";
import { DataLine } from "@/components/(clean-code)/data-table/Dl";
import { cn } from "@/lib/utils";
import { GetSalesOverview } from "../../../use-case/sales-item-use-case";
import { useSalesOverview } from "../overview-provider";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { TableCell } from "@/app/_components/data-table/table-cells";
import StatusBadge from "@/components/_v1/status-badge";
import { Icons } from "@/components/_v1/icons";

export type ItemGroupType = GetSalesOverview["itemGroup"][number];
export type ItemType = ItemGroupType["items"][number];
export type ItemAssignment = ItemType["assignments"][number];
export type ItemAssignmentSubmission = ItemAssignment["submissions"][number];
type PillsType = ItemType["pills"];
type AnalyticsType = ItemType["analytics"];
export function SalesShippingTab({}) {
    const ctx = useSalesOverview();
    const [showDetails, setShowDetails] = useState({});
    function toggleDetail(id) {
        setShowDetails((val) => {
            return {
                ...val,
                [id]: !val[id],
            };
        });
    }
    useEffect(() => {
        ctx.load();
    }, []);
    return (
        <div>
            {ctx.overview?.shipping?.list?.length == 0 ? (
                <div className="min-h-[70vh] gap-4 flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">No shipping yet</p>
                    <Button
                        onClick={() => {
                            ctx.createShipping();
                        }}
                    >
                        Create Shipping
                    </Button>
                </div>
            ) : (
                <div className="flex p-2 sm:px-4 border-b">
                    <div className="flex-1"></div>
                    <Button
                        onClick={() => {
                            ctx.createShipping();
                        }}
                        size="sm"
                    >
                        <Icons.add className="w-4 h-4 mr-2" />
                        <span>Create</span>
                    </Button>
                </div>
            )}
            <Table>
                <TableBody>
                    {ctx.overview?.shipping?.list?.map((ls) => (
                        <TableRow
                            className="cursor-pointer"
                            key={ls.id}
                            onClick={() => {
                                ctx.viewShipping(ls.id);
                            }}
                        >
                            <TableCell>{ls.date}</TableCell>
                            <TableCell>{ls.title}</TableCell>
                            <TableCell>
                                <StatusBadge
                                    status={ls.status || "In Progress"}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
interface LineItemProps {
    className?: string;
    item: ItemType;
    onClick?;
}
export function LineItem({ className = null, item, onClick }: LineItemProps) {
    const ctx = useSalesOverview();
    return (
        <div
            onClick={onClick}
            className={cn("bg-white sm:rounded-lg my-3 border", className)}
        >
            <div className="py-2 px-4">
                <div className="flex items-center">
                    <div className="flex-1 uppercase">{item.title}</div>
                    <div className="text-sm font-medium">
                        <Money value={item.total} />
                    </div>
                </div>
                <div className="flex justify-between">
                    <Pills item={item} />
                    <div className="flex-1"></div>
                </div>
            </div>
            {item.analytics?.info && (
                <div className="mt-1 flex justify-between border-t text-xs uppercase font-semibold text-muted-foreground">
                    {item.analytics?.info?.map((info, k) => (
                        <div className="text-start p-2 font-mono px-4" key={k}>
                            {info.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
export function Details({ group, show }: { show; group: ItemGroupType }) {
    if (!show) return null;
    return (
        <div className="grid sm:grid-cols-2 sm:gap-4 sm:-mx-8">
            {group.style.map((style, id) => (
                <DataLine key={id} {...style} />
            ))}
        </div>
    );
}
function SectionTitle({ title, children }) {
    if (!title && !children) return null;
    return (
        <div className="p-2  -mx-4 sm:-ml-8 flex justify-between items-center">
            <Label className="uppercase">{title}</Label>
            <div className="inline-flex space-x-2">{children}</div>
        </div>
    );
}
function Pills({ item }: { item: ItemType }) {
    if (!item.pills.filter((p) => p.value).length) return null;
    return (
        <div className="flex space-x-4 my-1">
            {item.pills
                ?.filter((p) => p.value)
                .map((pill, id) => (
                    <div key={id}>
                        <Badge
                            className="text-xs font-mono uppercase"
                            variant="secondary"
                        >
                            {pill.text}
                        </Badge>
                    </div>
                ))}
        </div>
    );
}