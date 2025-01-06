import { Prisma } from "@prisma/client";
import { CustomersQueryParams } from "../../data-access/customer.dta";
import { composeQuery } from "../db-utils";

export function whereCustomers(query: CustomersQueryParams) {
    const whereAnd: Prisma.CustomersWhereInput[] = [];
    if (query.search)
        whereAnd.push({
            OR: [
                { name: { contains: query.search } },
                { businessName: { contains: query.search } },
                { phoneNo: { contains: query.search } },
                { email: { contains: query.search } },
            ],
        });
    return composeQuery(whereAnd);
}
