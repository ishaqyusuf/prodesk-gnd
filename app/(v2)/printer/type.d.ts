import { generateCustomerPrintReport } from "./customer-report/_action";

export type GeneratCustomerPrintReport = Awaited<
    ReturnType<typeof generateCustomerPrintReport>
>;
