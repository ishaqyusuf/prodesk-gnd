"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface EmployeeQueryParamsProps extends BaseQuery {
  _show: "payroll" | undefined;
}
export async function getEmployees(query: EmployeeQueryParamsProps) {
  const where = whereEmployee(query);
  const items = await prisma.users.findMany({
    where,
    include: {
      employeeProfile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
    ...(await queryFilter(query)),
  });
  console.log(items[0]?.employeeProfile);
  const pageInfo = await getPageInfo(query, where, prisma.users);

  return {
    pageInfo,
    data: items.map(({ roles, ...data }) => ({
      ...data,
      role: roles?.[0]?.role,
    })) as any,
  };
}
function whereEmployee(query: EmployeeQueryParamsProps) {
  const q = {
    contains: query._q || undefined,
  };
  const where: Prisma.UsersWhereInput = {
    name: q,
  };

  return where;
}
export async function staticEmployees(
  query: EmployeeQueryParamsProps = {} as any
) {
  const employees = await prisma.users.findMany({
    where: whereEmployee(query),
    orderBy: {
      name: "asc",
    },
  });

  return employees;
}
