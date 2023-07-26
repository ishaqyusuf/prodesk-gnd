import { IAddressBook } from "@/app/api/sales-customers/type";
import {
  AddressBooks,
  Customers,
  OrderProductionSubmissions,
  Progress,
  SalesOrderItems,
  SalesOrders,
  SalesPayments,
  Users,
} from "@prisma/client";
import { UseFormReturn } from "react-hook-form";
export type ISalesOrderForm = UseFormReturn<ISalesOrder>;

export type IPriority = "Low" | "High" | "Medium" | "Non";
export type ProdStatus = "In Production" | "Completed" | "Queued";
export type IOrderType = "order" | "estimate";
export type ISalesOrder = SalesOrders & {
  customer?: Customers;
  billingAddress?: IAddressBook;
  shippingAddress?: IAddressBook;
  progress?: Progress[];
  producer?: Users;

  salesRep?: Users;
  items: ISalesOrderItem[] | undefined;
  payments: SalesPayments[] | undefined;
  prodStatus: ProdStatus;
  productions: OrderProductionSubmissions[];
  type: IOrderType;
  meta: ISalesOrderMeta;
};
export type ISalesOrderMeta = {
  manual_cost_price;
  cost_price;
  production_status;
  pre_build_qty: any;

  ccc;
  priority: IPriority;
  ccc_percentage;
  labor_cost;
  sales_profile;
  sales_percentage;
  po;
  manual_estimate: Boolean;
  good_until;
  rep;
  job_address;
  type: "estimate" | null;
  production_event;
  total_prod_qty;
  prod_status;
  payment_option: IPaymentOptions;
  sales_job_id;
  job: {
    status;
    estimated_cost;
    job_assigned_to;
    job_schedule;
  };
};
export type ISalesOrderItem = SalesOrderItems & {
  productions: OrderProductionSubmissions[];
  meta: ISalesOrderItemMeta;
  salesOrder: ISalesOrder;
};
export interface ISalesOrderItemMeta {
  supplier;
  prehung_description;
  prehung_information;
  product_information;
  product_description;
  prehung_cost;
  cost_price;
  computed_rate;
  sales_percentage;
  tax: "Tax" | "Non" | undefined;
  door_qty_selector;
  frame;
  product_cost;
  produced_qty;
  casing;
  hinge;
  line_index;
  lineIndex;
  uid;
  sales_margin;
  manual_cost_price;
  manual_rate;
  isComponent: Boolean;
  components: WizardKvForm;
}
export type IPaymentOptions =
  | "Cash"
  | "Credit Card"
  | "Check"
  | "COD"
  | "Zelle";
export type InventoryComponentCategory = "Door" | "Frame" | "Hinge" | "Casing";
export type IOrderComponent = {
  id;
  uuid;
  title;
  productId;
  type;
  price;
  qty;
  total;
  checked: Boolean;
  category: InventoryComponentCategory;
  // product: Products;
};
export interface WizardKvForm {
  [id: string]: Partial<IOrderComponent> | undefined;
}
