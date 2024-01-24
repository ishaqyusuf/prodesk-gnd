import {
    AddressBooks,
    CustomerTypes,
    OrderInventory,
    OrderProductionSubmissions,
    Progress,
    SalesItemSupply,
    SalesOrderItems,
    SalesOrders,
    SalesPayments,
    SalesPickup,
    Users,
} from "@prisma/client";
import { UseFormReturn } from "react-hook-form";
import { ICustomer } from "./customers";
import { BaseQuery } from "./action";
import { OmitMeta } from "./type";
import { IInboundOrderItems } from "./sales-inbound";
export type ISalesOrderForm = UseFormReturn<ISalesOrder>;

export type IPriority = "Low" | "High" | "Medium" | "Non";
export type ProdStatus = "In Production" | "Completed" | "Queued";
export type IOrderType = "order" | "estimate";
export type IOrderPrintMode = "quote" | "order" | "production" | "packing list";

export interface IBackOrderForm {
    backOrder: {
        [k in any]: {
            qty;
            backQty;
            prodQty;
            checked;
        };
    };
}
export type ISalesOrder = OmitMeta<SalesOrders> & {
    customer?: ICustomer;
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
    pickup: ISalesPickup;
    ctx: {
        prodPage?: Boolean;
    };
};
export interface ISalesPickup extends OmitMeta<SalesPickup> {
    meta: {
        signature;
    };
}
export type ISalesOrderMeta = {
    manual_cost_price;
    cost_price;
    production_status;
    pre_build_qty: any;
    qb;
    profileEstimate: Boolean;
    ccc;
    priority: IPriority;
    ccc_percentage;
    labor_cost;
    discount;
    sales_profile;
    sales_percentage;
    po;
    manual_estimate: Boolean;
    mockupPercentage: number;
    rep;
    job_address;
    type: "estimate" | null;
    production_event;
    total_prod_qty;
    prod_status;
    payment_option: IPaymentOptions;
    sales_job_id;
    truckLoadLocation;
    truck;
    job: {
        status;
        estimated_cost;
        job_assigned_to;
        job_schedule;
    };
};
export type ISalesOrderItem = Omit<SalesOrderItems, "meta"> & {
    productions: OrderProductionSubmissions[];
    meta: ISalesOrderItemMeta;
    salesOrder: ISalesOrder;
    supplies: SalesItemSupply[];
    inboundOrderItem: IInboundOrderItems[];
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
    tax: boolean;
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
    shelfMode?: boolean;
    housePackageTool: HousePackageTool;
}
export interface HousePackageTool {
    totalDoors: number;
    totalPrice: number;
    height: string;
    doorId?: number;
    jambSizeId?: number;
    doors: {
        [width in string]: {
            dimension: string;
            leftHand: number;
            rightHand: number;
            lineTotal: number; // unitPrice * lefHand+rightHand
            unitPrice: number;
            prices: { [title in string]: number };
        };
    };
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
    | "Inbound"
    | "Late"
    | undefined;
export interface SalesQueryParams extends BaseQuery {
    _q?;
    _backOrder?: boolean;
    _noBackOrder?: boolean;
    skip?;
    take?;
    page?;
    per_page?;
    sort?: "customer" | "status" | "prodDueDate";
    sort_order?: "asc" | "desc" | undefined;
    date?;
    from?;
    to?;
    _customerId?;
    status?: SalesStatus;
    statusNot?;
    _payment?: "Paid" | "Part" | "Pending";
    prodId?;
    _page?: "production" | undefined;
    type?: IOrderType;
    _dateType?: "createdAt" | "prodDueDate";
    deliveryOption?: "delivery" | "pickup";
    _salesRepId?;
    _deliveryStatus?:
        | "pending production"
        | "pending"
        | "ready"
        | "transit"
        | "queued"
        | "delivered";
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
    autoSave?: boolean;
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
    customer: ICustomer;
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
    taxxable?;
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
    order: {
        orderId;
        slug;
        id;
    };
}
export interface ISalesPayment extends OmitMeta<SalesPayments> {
    customer: ICustomer;
    order: ISalesOrder;
    meta: {
        ccc;
        ccc_percentage;
        sub_total;
        total_due;
        payment_option;
        paymentOption;
        checkNo;
    };
}
