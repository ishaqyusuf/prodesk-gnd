"use client";

import { useAppSelector } from "@/store";
import { ISalesOrder } from "@/types/sales";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderFlag from "../order-flag";
import { Info } from "../../info";
import { AddressBooks } from "@prisma/client";
import OrderOverviewActions from "../../actions/order-overview-actions";
import { convertToNumber } from "@/lib/use-number";
import Money from "@/components/money";
import { ProdStatusCell } from "@/components/columns/sales-columns";
import StatusBadge from "@/components/status-badge";
import { formatDate } from "@/lib/use-day";
import ProductionDueDate from "../prod-due-date";

interface Props {
  isProd?: Boolean;
  myProd?: Boolean;
}
export default function DetailsSection({ myProd }: Props) {
  const order: ISalesOrder = useAppSelector((s) => s.slicers.dataPage.data);
  const isProd = order?.ctx?.prodPage;
  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-2">
              <span>Order Information</span>
              <OrderFlag order={order} />
              <StatusBadge status={order?.prodStatus || "no status"} />
            </div>
            {isProd ? <></> : <OrderOverviewActions />}
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y space-y-4 flex flex-col">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Info label="Order ID">{order.orderId}</Info>
            <Info label="Production (Due)">
              {order.prodStatus}
              {order.prodDueDate && `(${formatDate(order.prodDueDate)})`}
              {/* <ProductionDueDate hideIcon data={order} editable={!myProd} /> */}
            </Info>

            <Info hidden={isProd} label="Invoice (Paid)">
              <span>
                <Money className="font-medium" value={order.grandTotal} /> (
                <Money
                  value={(order.grandTotal || 0) - (order.amountDue || 0)}
                />
                )
              </span>
            </Info>
            <Info
              label={order.type == "estimate" ? "Estimate Date" : "Order Date"}
            >
              <span>{formatDate(order.createdAt as any)}</span>
            </Info>
            {order.type == "estimate" ? (
              <>
                <Info label="Good Until">
                  <span>{formatDate(order.goodUntil as any)}</span>
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
              <span>{order.producer?.name || "Not Assigned"}</span>
            </Info>
          </div>
          {!isProd && (
            <div className="">
              <div className="pt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <AddressInfo label="Bill To" address={order.billingAddress} />
                <AddressInfo label="Ship To" address={order.shippingAddress} />
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
  address: AddressBooks | undefined;
  label;
}) {
  if (!address) return <Info label={label}>Not Specified</Info>;
  return (
    <Info label={label}>
      <p>{address?.name}</p>
      <p>{address?.phoneNo}</p>
      <p>{address?.address1}</p>
    </Info>
  );
}
