import { InboundOrderItems, InboundOrders } from "@prisma/client";
import { OmitMeta } from "./type";

export interface IInboundOrder extends OmitMeta<InboundOrders> {
  meta: {};
  items: IInboundOrderItems[];
  _count: {};
}
export interface IInboundOrderItems extends OmitMeta<InboundOrderItems> {
  meta: {};
}
