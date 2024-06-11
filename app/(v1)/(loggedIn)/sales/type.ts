import { getCustomersAction } from "./_actions/sales-customers";

export type GetCustomers = Awaited<ReturnType<typeof getCustomersAction>>;
