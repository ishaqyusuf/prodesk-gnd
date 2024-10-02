import { AddressBooks, SalesOrders, SalesStat, Taxes } from "@prisma/client";

export type SalesType = "order" | "quote";
export type SalesPriority = "Low" | "High" | "Medium" | "Non";
export type DykeStepTitles =
    | "Category"
    | "Shelf Items"
    | "Cutdown Height"
    | "House Package Tool"
    | "Height"
    | "Item Type"
    | "Door"
    | "Height"
    | "Specie"
    | "Moulding"
    | "Door Configuration"
    | "Door Type"
    | "Line Item";
export type DykeStepTitleKv = Partial<{
    [title in Partial<DykeStepTitles>]: DykeStepTitles;
}>;
export type SalesStatType = "dispatch" | "payment" | "prodAssignment" | "prod";
export type SalesStatStatus = "pending" | "in progress" | "completed";
export type TypedSalesStat = Omit<SalesStat, "status" | "type" | "id"> & {
    type: SalesStatType;
    id?: number;
    status?: SalesStatStatus;
};
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
export interface AddressBookMeta {
    zip_code;
}
export type TypedAddressBook = Omit<AddressBooks, "meta"> & {
    meta: AddressBookMeta;
};
// export type CreateTaxForm = Omit<Taxes, "sa">;
