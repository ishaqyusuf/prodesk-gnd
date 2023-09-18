import { InboundOrderItems, InboundOrders } from "@prisma/client";
import { OmitMeta } from "./type";
import { ISalesOrder, ISalesOrderItem } from "./sales";

export interface InboundOrder extends OmitMeta<InboundOrders> {
  meta: {};
  _count: {};
}
export interface IInboundOrder extends OmitMeta<InboundOrders> {
  meta: {};
  inboundItems: IInboundOrderItems[];
  _count: {};
}
export interface IInboundOrderItems extends OmitMeta<InboundOrderItems> {
  meta: {};
  salesOrderItems: ISalesOrderItem;
  InboundOrder: InboundOrder;
}
