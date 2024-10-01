import { SalesOrders, Taxes } from "@prisma/client";

export type SalesType = "order" | "quote";
export type SalesPriority = "Low" | "High" | "Medium" | "Non";
export type SalesStatType =
    | "prod"
    | "dispatch"
    | "payment"
    | "prodAssignment"
    | "prodCompleted";

export type SalesPrintMode =
    | "quote"
    | "order"
    | "production"
    | "packing list"
    | "order-packing";
export type DykeDoorType =
    | "Interior"
    | "Exterior"
    | "Shelf Items"
    | "Garage"
    | "Bifold"
    | "Moulding"
    | "Door Slabs Only"
    | "Services";
export type DeliveryOption = "delivery" | "pickup";
export type SalesPaymentOptions =
    | "Cash"
    | "Credit Card"
    | "Check"
    | "COD"
    | "Zelle";
export type SalesMeta = {
    qb;
    profileEstimate: Boolean;
    ccc;
    priority: SalesPriority;
    ccc_percentage;
    labor_cost;
    discount;
    sales_profile;
    sales_percentage;
    po;
    mockupPercentage: number;
    rep;
    total_prod_qty;
    payment_option: SalesPaymentOptions;
    truckLoadLocation;
    truck;
    tax?: boolean;
    calculatedPriceMode?: boolean;
};
export type TypedSales = SalesOrders & {
    type: SalesType;
    deliveryOption: DeliveryOption;
    meta: SalesMeta;
};

// export type CreateTaxForm = Omit<Taxes, "sa">;
