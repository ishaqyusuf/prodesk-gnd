import { useEffect, useState } from "react";
import { useSalesOverview } from "../../overview-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GetSalesOverview } from "../../../../../use-case/sales-item-use-case";
import { Badge } from "@/components/ui/badge";
import Money from "@/components/_v1/money";
import { DataLine } from "@/components/(clean-code)/data-table/Dl";
import { cn } from "@/lib/utils";

export type ItemGroupType = GetSalesOverview["itemGroup"][number];
export type ItemType = ItemGroupType["items"][number];
export type ItemAssignment = ItemType["assignments"][number];
export type ItemAssignmentSubmission = ItemAssignment["submissions"][number];
type PillsType = ItemType["pills"];
type AnalyticsType = ItemType["analytics"];
export function SalesItemsOverview({}) {
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
            {/* <Button onClick={() => ctx.load()}>Refresh</Button> */}
            {ctx.overview?.itemGroup?.map((grp, id) => (
                <div
                    className="text-sm sborder my-1.5 srounded-lg sshadow-sm group mx-4 sm:mx-8"
                    key={id}
                >
                    <SectionTitle title={grp.sectionTitle}>
                        <div className="flex space-x-4 opacity-0 group-hover:opacity-100">
                            {/* <Button size="sm" className="h-8" variant="outline">
                                Production
                            </Button> */}
                            {grp.style?.length && (
                                <Button
                                    onClick={() => toggleDetail(id)}
                                    size="sm"
                                    className="h-8 "
                                    variant={
                                        showDetails[id] ? "ghost" : "default"
                                    }
                                >
                                    {showDetails[id] ? "Hide" : "Components"}
                                </Button>
                            )}
                        </div>
                    </SectionTitle>
                    <Details show={showDetails[id]} group={grp} />
                    {grp.items.map((item, itemId) => (
                        <LineItem
                            key={itemId}
                            className={cn(
                                "",
                                ctx.tabData?.slug == "itemView" &&
                                    ctx.tabData?.meta?.groupIndex == id &&
                                    ctx.tabData?.payloadSlug == itemId
                                    ? "bg-muted-foreground/10"
                                    : item.analytics?.produceable
                                    ? "hover:bg-muted-foreground/10 cursor-pointer"
                                    : null
                            )}
                            onClick={() => {
                                if (item.analytics?.produceable)
                                    ctx.openItemTab(id, itemId);
                            }}
                            item={item}
                        />
                    ))}
                </div>
            ))}
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
            {item.analytics?.info && !ctx.item.isQuote && (
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
        <div className="grid ssm:grid-cols-2 sm:gap-2 sm:-mx-8">
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
