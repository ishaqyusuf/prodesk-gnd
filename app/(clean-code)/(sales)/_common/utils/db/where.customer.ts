import { Prisma } from "@prisma/client";
import { CustomersQueryParams } from "../../data-access/customer.dta";
import { composeQuery } from "../db-utils";

export function whereCustomers(query: CustomersQueryParams) {
    const whereAnd: Prisma.CustomersWhereInput[] = [];

    return composeQuery(whereAnd);
}
