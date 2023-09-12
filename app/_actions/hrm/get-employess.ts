"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface EmployeeQueryParamsProps extends BaseQuery {
  _show?: "payroll" | undefined;
  _roleId?;
  role?;
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
    orderBy: {
      name: "asc",
    },
  });
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
  if (query._roleId) {
    where.roles = {
      some: {
        roleId: +query._roleId,
      },
    };
  }
  if (query.role)
    where.roles = {
      some: {
        role: {
          name: query.role,
        },
      },
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
export async function staticLoadTechEmployees() {
  return await staticEmployees({
    role: "Punchout",
  });
}
export async function loadStatic1099Contractors() {
  return await staticEmployees({
    role: "1099 Contractor",
  });
}
