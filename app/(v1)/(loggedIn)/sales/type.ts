import { getCustomersAction } from "./_actions/sales-customers";

export type GetCustomers = Awaited<ReturnType<typeof getCustomersAction>>;
export type ShowCustomerHaving = "Pending Invoice" | "No Pending Invoice";
