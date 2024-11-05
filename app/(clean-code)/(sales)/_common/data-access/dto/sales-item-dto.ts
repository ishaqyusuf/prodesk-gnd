import { formatCurrency, sum } from "@/lib/utils";
import { GetFullSalesDataDta } from "../sales-dta";
import {
    inToFt,
    sortSalesItems,
    validateShowComponentStyle,
} from "../../utils/sales-utils";
import { salesItemAssignmentsDto } from "./sales-item-assignment-dto";
import { salesItemsStatsDto } from "./sales-stat-dto";

interface Pill {
    label?: string;
    value?: string;
    text?: string;
    color?: string;
}
export interface Qty {
    qty?;
    lh?;
    rh?;
    total?;
}
interface Analytics {
    assignment?: Qty;
    production?: Qty;
    delivery?: Qty;
}
export interface LineItemOverview {
    salesItemId;
    swing?;
    orderId;
    doorItemId?;
    title: string;
    size?: string;
    totalQty: Qty;
    rate?: number;
    total?: number;
    hasSwing?: boolean;
    pills?: Pill[];
    analytics?: {
        success: Analytics;
        pending: Analytics;
        produceable: boolean;
        info?: {
            title;
            text;
            percentage?: number;
            value?: number;
            total?: number;
        }[];
    };
    assignments?: {
        id;
        assignedTo;
        assignedToId;
        dueDate;
        qty: Qty;
        submitted: Qty;
        delivered: Qty;
        deliveries: { id; qty: Qty; date; deliveryId; submissionId }[];
        submissions: { id; qty: Qty; date }[];
        pending: Qty;
        _: {
            qtyAssigned;
            qtySubmitted;
        };
    }[];
}
type Item = GetFullSalesDataDta["items"][number];
export type Assignments = Item["assignments"];
export type LineAssignment = LineItemOverview["assignments"][number];
export type SalesOverviewDto = ReturnType<typeof salesOverviewDto>;
export function salesOverviewDto(data: GetFullSalesDataDta) {
    const itemGroup = salesItemGroupOverviewDto(data);
    // itemGroup.
    const stat = salesItemsStatsDto(data, itemGroup);
    return {
        itemGroup,
        stat,
    };
}

export function salesItemGroupOverviewDto(data: GetFullSalesDataDta) {
    function filter(item: Item, itemIndex) {
        if (data.isDyke) {
            return (
                (item.multiDyke && item.multiDykeUid) ||
                (!item.multiDyke && !item.multiDykeUid)
            );
        }
        return itemIndex == 0 || item.description?.includes("***");
    }
    data.items = data.items?.sort(sortSalesItems);
    const filteredItems = data.items.filter(filter);
    const itemGroup = filteredItems.map((item, fItemIndex) => {
        const startPointIndex = data.items.findIndex(
            (fi) => fi.id == filteredItems[fItemIndex]?.id
        );
        const breakPointIndex = data.items.findIndex(
            (fi) => fi.id == filteredItems[fItemIndex + 1]?.id
        );
        function filterGroup(_item: Item, itemIndex) {
            if (data.isDyke)
                return (
                    _item.id == item.id ||
                    (item.multiDyke && item.multiDyke == _item.multiDyke)
                );

            return _item.qty &&
                itemIndex >= startPointIndex &&
                breakPointIndex > 0
                ? itemIndex < breakPointIndex
                : itemIndex > startPointIndex &&
                      !_item?.description?.includes("**");
        }

        const groupedItems = data.items.filter(filterGroup);

        const items: LineItemOverview[] = [];
        groupedItems?.map((gItem) => {
            const { doors, door, molding, doorType } =
                gItem?.housePackageTool || {};
            if (doors?.length && door) {
                doors?.map((_door) => {
                    const pills = [
                        createTextPill(
                            inToFt(_door.dimension),
                            _door.dimension,
                            "blue"
                        ),
                    ];
                    let _totalQty;
                    let totalQty: Qty = {};
                    const isBifold = doorType == "Bifold";
                    if (isBifold) {
                        pills.push(
                            createTextPill(
                                `Qty x ${_door.lhQty}`,
                                _door.lhQty,
                                "blue"
                            )
                        );
                        _totalQty = _door.lhQty;
                        totalQty = {
                            total: _totalQty,
                            qty: _totalQty,
                        };
                    } else {
                        pills.push(
                            ...[
                                createTextPill(
                                    `${_door.lhQty} LH`,
                                    _door.lhQty,
                                    "blue"
                                ),
                                createTextPill(
                                    `${_door.rhQty} RH`,
                                    _door.rhQty,
                                    "orange"
                                ),
                            ]
                        );
                        _totalQty = sum([_door.lhQty, _door.rhQty]);
                        totalQty = {
                            total: _totalQty,
                            lh: _door.lhQty,
                            rh: _door.rhQty,
                        };
                    }
                    if (_door.swing)
                        pills.push(
                            createTextPill(_door.swing, _door.swing, "red")
                        );

                    if (_totalQty > 1)
                        pills.push(
                            createTextPill(
                                `${formatCurrency.format(_door.unitPrice)}/1`,
                                _door.unitPrice,
                                "blue"
                            )
                        );

                    items.push(
                        itemAnalytics(
                            {
                                size: _door.dimension,
                                swing: _door.swing,
                                hasSwing: !isBifold,
                                orderId: data.id,
                                salesItemId: gItem.id,
                                doorItemId: _door.id,
                                title: door.title,
                                totalQty,
                                rate: _door.unitPrice,
                                total: _door.lineTotal,
                                pills,
                            },
                            _door.productions
                        )
                    );
                });
            } else if (molding) {
                const pills = [
                    createTextPill(`qty x ${gItem.qty}`, gItem.qty, "purple"),
                ];
                if (gItem.qty > 0) {
                    pills.push(
                        createTextPill(
                            `${formatCurrency.format(gItem.rate)}/1`,
                            gItem.rate,
                            "blue"
                        )
                    );
                }
                items.push(
                    itemAnalytics(
                        {
                            orderId: data.id,
                            salesItemId: gItem.id,
                            title: molding.title,
                            totalQty: {
                                qty: gItem.qty,
                                total: gItem.qty,
                            },
                            rate: gItem.rate,
                            total: gItem.total,
                            pills,
                        },
                        [],
                        false
                    )
                );
            } else {
                const prodDel =
                    gItem.dykeProduction ||
                    (!data.isDyke && gItem.swing != null);
                items.push(
                    itemAnalytics(
                        {
                            swing: gItem.swing,
                            orderId: data.id,
                            salesItemId: gItem.id,
                            title: gItem.description,
                            totalQty: {
                                qty: gItem.qty,
                                total: gItem.qty,
                            },
                            // qty: {qty: gItem.qty},
                            rate: gItem.rate,
                            total: gItem.total,
                            pills: [
                                createTextPill(
                                    gItem.swing,
                                    gItem.swing,
                                    "purple"
                                ),
                                createTextPill(
                                    `qty x ${gItem.qty}`,
                                    gItem.qty,
                                    "purple"
                                ),
                            ],
                        },
                        gItem.assignments,
                        prodDel,
                        prodDel
                    )
                );
            }
        });

        return {
            sectionTitle:
                item.formSteps?.[0]?.value || starredTitle(item.description),
            items,
            style: componentStyle(item),
        };
    });
    return itemGroup;
}
function starredTitle(title: string) {
    if (title?.includes("***"))
        return title?.replaceAll("*", "")?.trim()?.toLocaleUpperCase();
    return null;
}
function itemAnalytics(
    data: LineItemOverview,
    assignments: Assignments,
    produceable = true,
    deliverable = true
) {
    data.analytics = { produceable, success: {}, pending: {} };
    if (produceable || deliverable) {
        const { analytics, totalQty } = data;
        const dynamicKey = data.totalQty.lh ? "lh" : "qty";
        if (produceable) {
            const _assignmentsLh = sum(assignments, "lhQty");
            const _assignmentsRh = sum(assignments, "rhQty");
            const totalAssignments = sum(assignments, "qtyAssigned");
            const prodCompleted = sum(
                assignments.map((a) => sum(a.submissions, "qty"))
            );
            const prodCompletedLh = sum(
                assignments.map((a) => sum(a.submissions, "lhQty"))
            );
            const prodCompletedRh = sum(
                assignments.map((a) => sum(a.submissions, "rhQty"))
            );
            analytics.success.assignment = {
                total: totalAssignments,
                rh: _assignmentsRh,
                [dynamicKey]: _assignmentsLh,
            };

            analytics.success.production = {
                total: prodCompleted,
                rh: prodCompletedRh,
                [dynamicKey]: prodCompletedLh,
            };
        }
        if (deliverable) {
            const deliveries = assignments
                .map((a) => a.submissions.map((s) => s.itemDeliveries).flat())
                .flat();
            const delivered = sum(deliveries, "qty");
            const deliveredLh = sum(deliveries, "lhQty");
            const deliveredRh = sum(deliveries, "rhQty");
            analytics.success.delivery = {
                [dynamicKey]: deliveredLh,
                rh: deliveredRh,
                total: delivered,
            };
        }
        analytics.pending = {
            assignment: produceable
                ? qtyDiff(totalQty, analytics.success.assignment)
                : {},
            delivery: qtyDiff(totalQty, analytics.success.delivery),
            production: produceable
                ? qtyDiff(totalQty, analytics.success.production)
                : {},
        };
        function registerInfo(text, key) {
            if (!analytics.info) analytics.info = [];
            const suc = analytics.success?.[key]?.total;
            const pen = analytics.pending?.[key]?.total;
            analytics.info.push({
                text: `${text}: ${suc}/${suc + pen}`,
                title: text,
                total: suc + pen,
                value: suc,
            });
        }
        if (produceable) {
            registerInfo("Assigned", "assignment");
            registerInfo("Completed", "production");
        }
        if (deliverable) registerInfo("Delivered", "delivery");
    }
    data.assignments = salesItemAssignmentsDto(data, assignments);
    return data;
}
export function qtyDiff(rh: Qty, lh: Qty, add = false): Qty {
    const mult = add ? 1 : -1;
    return {
        lh: sum([rh.lh, (lh?.lh || 0) * mult]),
        rh: sum([rh.rh, (lh?.rh || 0) * mult]),
        total: sum([rh.total, (lh?.total || 0) * mult]),
        qty: sum([rh.qty, (lh?.qty || 0) * mult]),
    };
}

function componentStyle(item: Item) {
    let styles: Pill[] = [];
    item.formSteps?.filter(validateShowComponentStyle).map((fs) => {
        styles.push(createPill(fs.step.title, fs.value));
    });
    return styles?.filter((s) => s.value);
}

function createTextPill(text, value, color = "blue") {
    return {
        text,
        value,
        color,
    };
}
function createPill(label, value, color = "blue") {
    return {
        label,
        value,
        color,
    };
}
// function createProgress
