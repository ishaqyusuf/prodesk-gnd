"use server";

import { prisma } from "@/db";

export async function getProductionUsersAction() {
  console.log("#");
  const users = await prisma.users.findMany({
    include: {
      _count: {
        select: {
          reppedProductions: {
            where: {
              // prodDueDate:{}
              prodStatus: {
                notIn: ["Completed"],
              },
            },
          },
        },
      },
    },
    where: {
      roles: {
        some: {
          role: {
            name: "Production",
          },
        },
      },
    },
  });
  console.log(users);
  return users;
}
export async function getCustomerProfilesList() {
  const profiles = await prisma.customerTypes.findMany({
    select: {
      id: true,
      title: true,
      coefficient: true,
    },
  });
  return profiles;
}
