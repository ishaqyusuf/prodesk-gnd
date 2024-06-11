import { getCustomersAction } from "./_actions/sales-customers";
import { getCustomerReport } from "./customers/_actions/customer-report";

export type GetCustomers = Awaited<ReturnType<typeof getCustomersAction>>;
export type GetCustomerReport = Awaited<ReturnType<typeof getCustomerReport>>;
export type ShowCustomerHaving = "Pending Invoice" | "No Pending Invoice";
