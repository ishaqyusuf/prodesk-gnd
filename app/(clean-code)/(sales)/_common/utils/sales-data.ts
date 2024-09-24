import { DykeDoorType } from "../../types";

const salesTaxes = [
    { code: "A", title: "County Tax", percentage: 1, on: "first 5000" },
    { code: "B", title: "Florida State Tax", percentage: 6, on: "total" },
] as const;
export type SalesTaxes = (typeof salesTaxes)[number];
export type TaxCodes = SalesTaxes["code"];

const salesTaxByCode: { [id in TaxCodes]: SalesTaxes } = {
    A: salesTaxes[0],
    B: salesTaxes[1],
};
export default {
    productionDoorTypes: ["Garage", "Interior", "Exterior"] as DykeDoorType[],
    salesTaxes,
    salesTaxByCode,
};
