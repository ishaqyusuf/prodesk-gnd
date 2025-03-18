export const Cookies = {
    SalesChartType: "sales-chart-type",
    SalesRoute: "sales-route",
    QuotesRoute: "quote-route",
};
export const ROUTE_VERSIONS = {
    sales: {
        old: "/sales",
        new: "",
    },
    quotes: {
        old: "",
        new: "",
    },
};
export const Tags = {
    salesCustomers: "sales_customers",
    salesCustomerProfiles: "sales_customer_profiles",
    salesTaxCodes: "sales_tax_codes",
    shelfProducts: "shelf_products",
    shelfCategories: "shelf-categories",
};
export const Events = {
    salesCreated: "sales_created",
    salesDeleted: "sales_deleted",
    salesUpdated: "sales_updated",
} as const;
export type EventTypes = keyof typeof Events;
