import { useEffect } from "react";
import { loadPageData } from "../helper";

import { salesOverviewStore } from "../store";
import { cn } from "@/lib/utils";
import Money from "@/components/_v1/money";
import { Badge } from "@/components/ui/badge";
import { ItemOverview } from "./item-overview";

export function SalesItemsTab({}) {
    const store = salesOverviewStore();
    const itemOverview = store.itemOverview;
    useEffect(() => {
        loadPageData({
            dataKey: "overview",
        });
    }, []);
    if (!itemOverview) return;
    return (
        <div>
            {itemOverview?.items?.map((item) => (
                <div className="flex flex-col gap-2" key={item.itemControlUid}>
                    {item.primary && item.sectionTitle && (
                        <div className="uppercase py-2 bg-muted text-center font-mono font-semibold">
                            {item.sectionTitle}
                        </div>
                    )}
                    {!item.hidden && (
                        <div
                            className={cn(
                                item.sectionTitle && "ml-4",
                                "border border-transparent border-b-muted-foreground/20 rounded-b-none rounded-lg",
                                item.itemControlUid != store.itemViewId
                                    ? "cursor-pointer hover:bg-muted/30 hover:shadow-lg hover:border-muted-foreground/30"
                                    : "border border-muted-foreground/50  shadow-sm bg-muted/30"
                            )}
                        >
                            <div
                                className={cn("p-2 pt-4 text-sm", "space-y-2")}
                                onClick={() => {
                                    store.update(
                                        "itemViewId",
                                        item.itemControlUid
                                    );
                                    store.update("itemView", item);
                                }}
                            >
                                <div className="flex gap-6 justify-between">
                                    <div className="flex-1 font-medium uppercase">
                                        {item.title}
                                    </div>
                                    <div className="font-mono text-sm font-medium">
                                        <Money value={item.totalCost} />
                                    </div>
                                </div>
                                {item.lineConfigs?.length && (
                                    <div className="flex gap-4 justify-end">
                                        {item.lineConfigs?.map((c) => (
                                            <Badge
                                                key={c}
                                                className="text-muted-foreground font-semibold"
                                                variant="outline"
                                            >
                                                {c}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <div className="flex pt-2 gap-6">
                                    <div className="flex-1 flex justify-end">
                                        {item.produceable && (
                                            <>
                                                <div className="flex-1">
                                                    <Pill
                                                        label="Assigned"
                                                        value={`${item.status?.prodAssigned?.total}/${item.status?.qty?.total}`}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Pill
                                                        label="Completed"
                                                        value={`${item.status?.prodCompleted?.total}/${item.status?.qty?.total}`}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {item.shippable && (
                                            <div className="flex-1">
                                                <Pill
                                                    label="FulFilled"
                                                    value={`${item.status?.dispatchCompleted?.total}/${item.status?.qty?.total}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className=""></div>
                                </div>
                            </div>
                            {item.itemControlUid == store.itemViewId && (
                                <ItemOverview />
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
function ItemDetails() {}
function Pill({ label, value }) {
    return (
        <div className="flex whitespace-nowrap uppercase font-semibold font-mono text-xs text-muted-foreground">
            {label}: {value}
        </div>
    );
}
