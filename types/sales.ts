import {
  AddressBooks,
  CustomerTypes,
  Customers,
  OrderInventory,
  OrderProductionSubmissions,
  Progress,
  SalesOrderItems,
  SalesOrders,
  SalesPayments,
  Users,
} from "@prisma/client";
import { UseFormReturn } from "react-hook-form";
import { ICustomer } from "./customers";
export type ISalesOrderForm = UseFormReturn<ISalesOrder>;

export type IPriority = "Low" | "High" | "Medium" | "Non";
export type ProdStatus = "In Production" | "Completed" | "Queued";
export type IOrderType = "order" | "estimate";
export type IOrderPrintMode = "quote" | "order" | "production" | "packing list";
export type ISalesOrder = SalesOrders & {
  customer?: Customers;
  billingAddress?: any;
  shippingAddress?: any;
  progress?: Progress[];
  producer?: Users;

  salesRep?: Users;
  items: ISalesOrderItem[] | undefined;
  payments: ISalesPayment[] | undefined;
  prodStatus: ProdStatus;
  productions: OrderProductionSubmissions[];
  type: IOrderType;
  meta: ISalesOrderMeta;
  ctx: {
    prodPage?: Boolean;
  };
};
export type ISalesOrderMeta = {
  manual_cost_price;
  cost_price;
  production_status;
  pre_build_qty: any;
  qb;
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
  produced_qty: number | undefined | null;
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
export interface IAddressBook extends AddressBooks {
  meta: {
    zip_code;
  };
  customer: ICustomer;
}

export type AddressType = "shippingAddress" | "billingAddress";

export type SalesStatus =
  | "Queued"
  | "Started"
  | "Completed"
  | "No Status"
  | "Unassigned"
  | undefined;
export interface SalesQueryParams {
  _q?;
  skip?;
  take?;
  page?;
  per_page?;
  sort?: "customer" | "status" | "prodDueDate";
  sort_order?: "asc" | "desc" | undefined;
  date?;
  from?;
  to?;
  status?: SalesStatus;
  _payment?: "Paid" | "Part" | "Pending";
  prodId?;
  _page?: "production" | undefined;
  type?: IOrderType;
  _dateType?: "createdAt" | "prodDueDate";
}
export interface UpdateOrderPriorityProps {
  priority;
  orderId;
}
export interface CopyOrderActionProps {
  orderId;
  as: "estimate" | "order";
}
export interface SaveOrderActionProps {
  order: SalesOrders;
  deleteIds?: Number[];
  id?;
  items: ISalesOrderItem[];
}
export interface ISaveOrder {
  order: SalesOrders;
  deleteIds?: Number[];
  id?;
  items: ISalesOrderItem[];
}
export interface ISalesAddressForm {
  billingAddress: IAddressBook;
  shippingAddress: IAddressBook;
  sameAddress: Boolean;
  profile: CustomerTypes;
}
export interface IFooterInfo {
  rows: {
    [name in any]: FooterRowInfo;
  };
}
export interface FooterRowInfo {
  rowIndex;
  total?;
  notTaxxed?;
}
export interface IOrderInventoryUpdate {
  component: IOrderComponent;
  parent?: IOrderComponent;
  currentData?: OrderInventory;
  checked?;
}
export interface ISaveOrderResponse {
  components: IOrderComponent[];
  updates: IOrderInventoryUpdate[];
}
export interface IOrderInventoryUpdate {
  component: IOrderComponent;
  parent?: IOrderComponent;
  currentData?: OrderInventory;
  checked?;
}
export type ProdActions = "Start" | "Cancel" | "Complete" | "Stop";
export interface ProdActionProps {
  action: ProdActions;
  itemId;
  qty?;
  note?;
}
export interface ISalesPayment extends SalesPayments {
  meta: {
    ccc;
    ccc_percentage;
    sub_total;
    total_due;
    payment_option;
    paymentOption;
  };
}
