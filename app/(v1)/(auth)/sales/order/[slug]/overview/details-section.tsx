"use client";

import { useAppSelector } from "@/store";
import { IAddressBook, ISalesOrder } from "@/types/sales";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderFlag from "../../../../../../../components/_v1/sales/order-flag";
import { Info } from "../../../../../../../components/_v1/info";
import { AddressBooks } from "@prisma/client";
import OrderOverviewActions from "../../../../../../../components/_v1/actions/order-overview-actions";
import { convertToNumber } from "@/lib/use-number";
import Money from "@/components/_v1/money";
import { ProdStatusCell } from "@/components/_v1/columns/sales-columns";
import StatusBadge from "@/components/_v1/status-badge";
import { formatDate } from "@/lib/use-day";
import ProductionDueDate from "../../../../../../../components/_v1/sales/prod-due-date";

interface Props {
    isProd?: Boolean;
    myProd?: Boolean;
    estimate?: Boolean;
}
export default function DetailsSection({ myProd, estimate }: Props) {
    const order: ISalesOrder = useAppSelector((s) => s.slicers.dataPage.data);
    const isProd = order?.ctx?.prodPage;
    return (
        <div className="">
            <Card className="max-sm:border-none">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="inline-flex items-center space-x-2">
                            <span>
                                {estimate ? "Estimate " : "Order "} Information
                            </span>
                            <OrderFlag order={order} />
                            <StatusBadge
                                status={order?.prodStatus || "no status"}
                            />
                        </div>
                        {isProd ? (
                            <></>
                        ) : (
                            <OrderOverviewActions estimate={estimate} />
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y space-y-4 flex flex-col">
                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                        <Info label="Order ID">{order.orderId}</Info>
                        <Info label="Production (Due)">
                            {order.prodStatus}
                            {order.prodDueDate &&
                                `(${formatDate(order.prodDueDate)})`}
                            {/* <ProductionDueDate hideIcon data={order} editable={!myProd} /> */}
                        </Info>

                        <Info hidden={isProd} label="Invoice (Paid)">
                            <span>
                                <Money
                                    className="font-medium"
                                    value={order.grandTotal}
                                />{" "}
                                (
                                <Money
                                    value={
                                        (order.grandTotal || 0) -
                                        (order.amountDue || 0)
                                    }
                                />
                                )
                            </span>
                        </Info>
                        <Info
                            label={
                                order.type == "estimate"
                                    ? "Estimate Date"
                                    : "Order Date"
                            }
                        >
                            <span>{formatDate(order.createdAt as any)}</span>
                        </Info>
                        {order.type == "estimate" ? (
                            <>
                                <Info label="Good Until">
                                    <span>
                                        {formatDate(order.goodUntil as any)}
                                    </span>
                                </Info>
                            </>
                        ) : (
                            <>
                                <Info label="Payment Terms">
                                    <p>{order.paymentTerm}</p>
                                    <p>{formatDate(order.goodUntil as any)}</p>
                                </Info>
                            </>
                        )}
                        <Info label="Sales Rep">
                            <span>{order.salesRep?.name}</span>
                        </Info>
                        <Info label="Production">
                            <span>
                                {order.producer?.name || "Not Assigned"}
                            </span>
                        </Info>
                    </div>
                    {!isProd && (
                        <div className="">
                            <div className="pt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                                <AddressInfo
                                    label="Bill To"
                                    address={order.billingAddress}
                                />
                                <AddressInfo
                                    label="Ship To"
                                    address={order.shippingAddress}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
function AddressInfo({
    address,
    label,
}: {
    address: IAddressBook | undefined;
    label;
}) {
    // console.log(address);
    if (!address) return <Info label={label}>Not Specified</Info>;
    return (
        <Info label={label}>
            <p>{address?.name}</p>
            <p>
                {address?.phoneNo}{" "}
                {address?.phoneNo2 ? `(${address?.phoneNo2})` : ""}
            </p>
            <p>{address?.address1}</p>
            <p>
                {[address?.state, address?.city, address?.meta?.zip_code]
                    ?.filter(Boolean)
                    .join(", ")}
            </p>
        </Info>
    );
}