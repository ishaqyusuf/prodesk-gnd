"use server";

import { prisma } from "@/db";

export async function staticRolesAction() {
  const roles = await prisma.roles.findMany({});
  return roles;
}
