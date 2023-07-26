import { IOrderPrintMode } from "@/app/(auth)/sales/orders/components/row-action/print-order-menu";
import { ISalesOrder, ISalesOrderItem } from "@/types/ISales";

export interface OrderPrintProps {
  order: ISalesOrder;
  items: ISalesOrderItem & {
    sn;
  };
  address: {
    title: String;
    lines: String;
  }[];
  info1: { title; value; style; value_style }[];
  info2: { title; value; style; value_style }[];
}

export function printOrder(order: ISalesOrder, mode: IOrderPrintMode) {
  const isClient = mode !== "production";
}
