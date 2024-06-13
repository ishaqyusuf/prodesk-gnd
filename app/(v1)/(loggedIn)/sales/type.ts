import { getCustomerReport } from "./(customers)/_actions/customer-report";
import { getCustomersAction } from "./(customers)/_actions/sales-customers";

export type GetCustomers = Awaited<ReturnType<typeof getCustomersAction>>;
export type GetCustomerReport = Awaited<ReturnType<typeof getCustomerReport>>;
export type ShowCustomerHaving = "Pending Invoice" | "No Pending Invoice";
export type InvoicePastDue = "1-30" | "31-60" | "61-90" | ">90";
