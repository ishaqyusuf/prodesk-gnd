import { assign, padStart } from "lodash";
import { GetFullSalesDataDta } from "../sales-dta";
import { Qty, qtyDiff, SalesOverviewDto } from "./sales-item-dto";
import { sum } from "@/lib/utils";
import { formatDate } from "@/lib/use-day";
import { GetSalesDispatchListDta } from "../sales-dispatch-dta";

export type SalesDispatchListItem = GetSalesDispatchListDta["data"][number];
export type SalesDispatchListDto = ReturnType<typeof salesDispatchListDto>;
export function salesDispatchListDto(data: SalesDispatchListItem) {
    return {
        orderDate: data.order.createdAt,
        orderId: data.order.orderId,
        dispatchDate: data.createdAt,
        dispatchId: data.id,
        uuid: data.id,
        status: data.status,
        salesRep: data.order.salesRep.name,
        shipping: {
            address: data.order.shippingAddress.address1,
        },
        customer: {
            address: data.order.customer?.address,
            name:
                data.order.customer?.businessName || data.order.customer?.name,
            // name: data.order.
        },
    };
}
export type SalesShippingDto = ReturnType<typeof salesShippingDto>;
export function salesShippingDto(
    overview: SalesOverviewDto,
    data: GetFullSalesDataDta
) {
    //    data.deliveries
    const dispatchStat = overview.stat.calculatedStats.dispatch;
    const dispatchableItemList = overview?.itemGroup
        ?.map((grp) => {
            return grp?.items?.map((item, uid) => {
                const analytics = item.analytics;
                const pendingDelivery = analytics.pending.delivery?.total;
                const totalDelivered = analytics.success.delivery?.total;
                const totalProd = analytics.success.production?.total || 0;
                const deliverable =
                    (analytics.pending.production
                        ? totalProd
                        : totalDelivered + pendingDelivery) - totalDelivered;
                const assignments = item.assignments;

                const deliverableSubmissions = assignments
                    .map((assignment) => {
                        return assignment.submissions
                            .map((sub) => {
                                // console.log(sub.)
                                let pendingDelivery = sub.qty;
                                // console.log(pendingDelivery);

                                assignment.deliveries
                                    .filter((d) => d.submissionId == sub.id)
                                    .map((s) => {
                                        pendingDelivery = qtyDiff(
                                            pendingDelivery,
                                            s.qty
                                        );
                                    });
                                return {
                                    qty: pendingDelivery,
                                    subId: sub.id,
                                };
                            })
                            .filter((s) => s.qty.total > 0);
                    })
                    .flat();

                let deliverableQty = !analytics.produceable
                    ? qtyDiff(
                          analytics.pending.delivery,
                          analytics.success.delivery,
                          true
                      )
                    : deliverableSubmissions[0]?.qty || {};

                deliverableSubmissions?.map((s, i) => {
                    if (i > 0)
                        deliverableQty = qtyDiff(deliverableQty, s, true);
                });
                return {
                    hasSwing: item.hasSwing,
                    swing: item.swing,
                    size: item.size,
                    id: item.salesItemId,
                    uid: `${item.salesItemId}-${uid}`,
                    section: grp.sectionTitle,
                    totalQty: item.totalQty,
                    pendingDelivery,
                    totalDelivered,
                    analytics,
                    title: item.title,
                    deliverable,
                    deliverableSubmissions,
                    deliverableQty,
                    assignments,
                };
            });
        })
        .flat();
    let deliveries = data.deliveries.map((d) => {
        const totalDeliveries = sum(d.items.map((i) => i.qty));
        const items = d.items.map((dItem) => {
            // console.log(dItem);

            return {
                id: dItem.id,
                itemId: dItem.orderItemId,
                qty: {
                    lh: dItem.lhQty,
                    rh: dItem.rhQty,
                    qty: dItem.lhQty || dItem.rhQty ? null : dItem.qty,
                    total: dItem.qty,
                } as Qty,
            };
        });
        return {
            id: d.id,
            date: formatDate(d.createdAt),
            title: `#DISPATCH-${padStart(d.id.toString(), 4, "0")}`,
            score: totalDeliveries,
            total: dispatchStat.total,
            status: d.status,
            items,
        };
    });

    return {
        list: deliveries,
        dispatchableItemList,
        deliveryMode: data.deliveryOption,
        orderId: data.id,
    };
}
