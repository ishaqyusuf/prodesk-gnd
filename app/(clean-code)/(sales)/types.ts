import { AddressBooks, SalesOrders, SalesStat, Taxes } from "@prisma/client";
import { DykeForm as OldDykeForm } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { FieldPath } from "react-hook-form";
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
    | "Jamb Species"
    | "Jamb Type"
    | "Jamb Size"
    | "Door Type"
    | "Line Item";
export type DykeStepTitleKv = Partial<{
    [title in Partial<DykeStepTitles>]: DykeStepTitles;
}>;
export type SalesStatType =
    | "dispatch"
    | "dispatchTransit"
    | "payment"
    | "prodAssignment"
    | "prod"
    | "dispatchQueue";
export type SalesDispatchStatus =
    | "queue"
    | "in progress"
    | "completed"
    | "cancelled";
export type SalesStatStatus =
    | "pending"
    | "in progress"
    | "completed"
    | "unknown"
    | "N/A";
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
export interface SalesItemMeta {
    supplier;
    supplyDate;
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
    doorType: DykeDoorType;

    _dykeSizes: { [size in string]: boolean };
    // _dykeMulti: { [item in string]: boolean };
}
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
export interface StepComponentMeta {
    stepSequence?: { id?: number }[];
    deleted?: { [uid in string]: boolean };
    show?: { [uid in string]: boolean };
}
export interface DykeProductMeta {
    svg;
    url;
    sortIndex?;
    priced?: boolean;
    mouldingSpecies: { [id in string]: boolean };
    doorPrice?: { [size in string]: number };
}

export type DykeFormData = OldDykeForm;
export type OldDykeFormData = OldDykeForm;
export type DykeFormDataPath = FieldPath<OldDykeFormData>;
export type DykeFormItemData = OldDykeForm["itemArray"][number];
export type DykeFormStepData =
    DykeFormItemData["item"]["formStepArray"][number];
export type DykeFormStepDataPath = FieldPath<DykeFormStepData>;
export type DykeFormItemDataPath = FieldPath<DykeFormItemData>;
export type ItemMultiComponentData =
    DykeFormItemData["multiComponent"]["components"][number];
export type ItemMultiComponentSizeData =
    ItemMultiComponentData["_doorForm"][number];
export type ItemMultiComponentSizeDataPath =
    FieldPath<ItemMultiComponentSizeData>;
export type ItemMultiComponentDataPath = FieldPath<ItemMultiComponentData>;

export interface HousePackageToolSettingsMeta {
    sizes: {
        ft: string;
        in: string;
        type?: DykeDoorType;
        width: boolean;
        height: boolean;
    }[];
}
export interface HousePackageToolSettings {
    id: number;
    type: string;
    data: HousePackageToolSettingsMeta;
}

export type SalesPaymentType = "square_terminal" | "square_link";
export type SalesPaymentStatus = "pending" | "success" | "cancelled";
